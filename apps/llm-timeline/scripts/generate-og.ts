#!/usr/bin/env tsx

/**
 * generate-og.ts — render one 1200×630 Open Graph card per page that needs an
 * image, into `public/og/<kind>/<slug>.png`.
 *
 * Why: this app is ~1,500 prerendered URLs (1,448 org pages, 66 year pages, 3
 * license pages, plus the root). Before this, the root reused a screenshot
 * borrowed from another app and every sub-page had no image at all, so a link
 * pasted into a chat window unfurled as a text-only card. Cards are the only
 * lever on that at this URL count, and they have to be generated — hand-authoring
 * 1,500 PNGs is not an option.
 *
 * The cards are deliberately TEXT-ONLY. This app has no per-org or per-year
 * artwork, so `renderOgCard` gets no `image` and renders a clean type card.
 * Passing a fabricated photo would be worse than no photo.
 *
 * Runs in prebuild, before Vite. No network access: everything it needs is
 * already in `lib/data.ts`.
 *
 * Usage:
 *   tsx scripts/generate-og.ts                    # every card (prebuild)
 *   tsx scripts/generate-og.ts --limit=8          # first 8, re-rendered, for iteration
 *   tsx scripts/generate-og.ts --kind=year        # one kind: index|org|year|license
 *   tsx scripts/generate-og.ts --concurrency=4    # cap in-flight cards
 *   tsx scripts/generate-og.ts --force            # re-render even if the PNG exists
 *
 * `--limit` implies `--force`: it exists to eyeball a handful of cards, and
 * "skipped, already present" is never the answer you want from it.
 *
 * Failure policy: a card that fails to render is reported by path and counted,
 * but does NOT fail the build. One bad org name must not take down a deploy
 * that would otherwise ship 1,499 working cards.
 */

import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { type CardInput, LIGHT_THEME, renderOgCard } from "@duyet/config/og-card";
import { models, organizations, years } from "../lib/data";
import {
  LICENSE_LABELS,
  LICENSES,
  OG_PREFIX,
  type OgKind,
  ogImagePath,
} from "../lib/og";
import { slugify } from "../lib/utils";

const APP_DIR = resolve(import.meta.dirname, "..");
const OUT_DIR = join(APP_DIR, "public", OG_PREFIX.slice(1));

/**
 * Type-only cards get a full-width text column: the default 0.62 panel exists to
 * leave room for a dither background, and with no image it just strands 456px of
 * empty paper on the right.
 */
const CARD_OPTIONS = { theme: LIGHT_THEME, panelWidth: 1 } as const;

/**
 * NO `description` on any card here — and that is load-bearing, not an omission.
 *
 * `cardToSvg` positions the accent hairline at `metaY - 34`, i.e. relative to the
 * meta line only. Drop a description in and the block below it lands on top of
 * the hairline: the rule strikes straight through the last line of text, on
 * every card. `CardInput.description` is therefore left unset here and the
 * per-page copy stays where crawlers actually read it — `og:description` /
 * `<meta name="description">` — while the card carries the facts that differ
 * between pages (counts, year span) in `meta`.
 */

type CardJob = {
  kind: OgKind;
  /** Path relative to `public/`, always ending in `.png`. */
  outPath: string;
  input: CardInput;
};

// ── CLI ──────────────────────────────────────────────────────────────────────

function argValue(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

const limitArg = argValue("limit");
const LIMIT = limitArg ? Number.parseInt(limitArg, 10) : 0;
const kindArg = argValue("kind");
const KINDS: OgKind[] = kindArg
  ? (kindArg.split(",").filter(Boolean) as OgKind[])
  : ["index", "org", "year", "license"];
const concArg = argValue("concurrency");
const CONCURRENCY = concArg ? Number.parseInt(concArg, 10) : 0;
const FORCE = process.argv.includes("--force") || LIMIT > 0;
const CLEAN = !LIMIT && !kindArg;

/**
 * Cards in flight at once. Kept deliberately low: libvips holds a full raster
 * per in-flight card, and this script runs in a monorepo prebuild alongside
 * whatever else the machine is doing. Four keeps it at a few hundred MB while
 * still overlapping libuv's own thread pool; the whole 1,500-card set finishes
 * in well under a minute at this setting.
 */
const DEFAULT_CONCURRENCY = 4;

if (limitArg && (!Number.isFinite(LIMIT) || LIMIT <= 0)) {
  console.error(
    `generate-og: --limit must be a positive integer, got "${limitArg}"`
  );
  process.exit(1);
}
if (concArg && (!Number.isFinite(CONCURRENCY) || CONCURRENCY <= 0)) {
  console.error(
    `generate-og: --concurrency must be a positive integer, got "${concArg}"`
  );
  process.exit(1);
}

// ── Copy helpers ─────────────────────────────────────────────────────────────

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

/** `2019–2026`, or just `2020` when the span is a single year. */
function yearSpan(first: number, last: number): string {
  return first === last ? `${last}` : `${first}–${last}`;
}

/** Mirrors `cardToSvg`'s internal 120-char title clamp. */
const TITLE_CLAMP = 120;

/**
 * Truncate a title to the renderer's clamp, ending on a period rather than the
 * renderer's `…`.
 *
 * `cardToSvg` would otherwise cut a long org name to `…Algorithms…`, which reads
 * as a typo rather than an abbreviation, and — because `…` is a narrow glyph —
 * the last word crowds onto the previous line. Ending on a `.` instead pushes it
 * onto its own line. Pre-truncating here (rather than letting the renderer clamp)
 * is what lets the substitute punctuation land inside the budget.
 *
 * Only ~30 of the 1,448 org cards have names this long; the rest pass through
 * untouched, so the og:title and the card title stay identical.
 */
function cardTitle(s: string): string {
  if (s.length <= TITLE_CLAMP) return s;
  return `${s.slice(0, TITLE_CLAMP - 2).trimEnd()}.`;
}

// ── Data aggregation (one pass over `models`) ────────────────────────────────

type OrgStats = { count: number; first: number; last: number };
type YearStats = { count: number; orgs: Set<string> };
type LicenseStats = { count: number };

const orgStats = new Map<string, OrgStats>();
const yearStats = new Map<number, YearStats>();
const licenseStats = new Map<string, LicenseStats>();

for (const model of models) {
  const year = new Date(model.date).getFullYear();

  const org = orgStats.get(model.org) ?? { count: 0, first: year, last: year };
  org.count += 1;
  org.first = Math.min(org.first, year);
  org.last = Math.max(org.last, year);
  orgStats.set(model.org, org);

  const yr = yearStats.get(year) ?? { count: 0, orgs: new Set<string>() };
  yr.count += 1;
  yr.orgs.add(model.org);
  yearStats.set(year, yr);

  licenseStats.set(model.license, {
    count: (licenseStats.get(model.license)?.count ?? 0) + 1,
  });
}

// ── Job construction ─────────────────────────────────────────────────────────

/**
 * One card per distinct org *slug*, not per org name: `getSlug` truncates at 100
 * chars and lower-cases, so a handful of very large collaboration entries collide
 * on one slug — and the `/org/$slug` route resolves those to the first match
 * anyway. Deduplicating on first-occurrence order (the same order the route's
 * `organizations.find` walks) is what makes the card match the page.
 */
function orgJobs(): CardJob[] {
  const seen = new Set<string>();
  const jobs: CardJob[] = [];

  for (const org of organizations) {
    const slug = slugify(org);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);

    const stats = orgStats.get(org);
    jobs.push({
      kind: "org",
      outPath: ogImagePath("org", slug),
      input: {
        title: cardTitle(org),
        eyebrow: "Organization",
        meta: stats
          ? `${plural(stats.count, "model")} · ${yearSpan(stats.first, stats.last)}`
          : "No releases recorded",
        siteName: "llm-timeline.duyet.net",
      },
    });
  }
  return jobs;
}

function yearJobs(): CardJob[] {
  return years.map((year) => {
    const stats = yearStats.get(year);
    return {
      kind: "year" as const,
      outPath: ogImagePath("year", String(year)),
      input: {
        // A four-digit year as a poster numeral, with the brand in the eyebrow.
        title: String(year),
        eyebrow: "LLM Timeline · Year",
        meta: stats
          ? `${plural(stats.count, "model")} · ${plural(stats.orgs.size, "org")}`
          : "No releases recorded",
        siteName: "llm-timeline.duyet.net",
      },
    };
  });
}

function licenseJobs(): CardJob[] {
  const total = models.length;
  return LICENSES.map((type) => {
    const stats = licenseStats.get(type);
    const count = stats?.count ?? 0;
    const share = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      kind: "license" as const,
      outPath: ogImagePath("license", type),
      input: {
        title: LICENSE_LABELS[type],
        eyebrow: "License",
        meta: `${plural(count, "model")} · ${share}% of the timeline`,
        siteName: "llm-timeline.duyet.net",
      },
    };
  });
}

function indexJob(): CardJob {
  const earliest = years[years.length - 1];
  const latest = years[0];
  return {
    kind: "index",
    outPath: ogImagePath("index"),
    input: {
      title: "LLM Timeline",
      eyebrow: "duyet.net",
      meta: `${plural(models.length, "model")} · ${plural(
        organizations.length,
        "org"
      )} · ${earliest}–${latest}`,
      siteName: "llm-timeline.duyet.net",
    },
  };
}

function buildJobs(): CardJob[] {
  const jobs: CardJob[] = [];
  if (KINDS.includes("index")) jobs.push(indexJob());
  if (KINDS.includes("org")) jobs.push(...orgJobs());
  if (KINDS.includes("year")) jobs.push(...yearJobs());
  if (KINDS.includes("license")) jobs.push(...licenseJobs());
  return LIMIT > 0 ? jobs.slice(0, LIMIT) : jobs;
}

// ── Render ───────────────────────────────────────────────────────────────────

/**
 * Bounded-concurrency map. libvips does its rasterization on libuv's own thread
 * pool, so a few in-flight cards overlap real CPU work; the JS that assembles
 * each SVG is serialized, which is why the pool is small and explicit rather
 * than `cpus().length`.
 */
async function pool(
  jobs: CardJob[],
  concurrency: number,
  run: (job: CardJob) => Promise<void>
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, jobs.length) }, () =>
    (async () => {
      while (cursor < jobs.length) {
        const job = jobs[cursor++];
        await run(job);
      }
    })()
  );
  await Promise.all(workers);
}

async function main(): Promise<void> {
  // A full run regenerates everything, so drop the previous output first: org
  // names get merged and renamed, and a stale card is a URL that serves an
  // image describing a different page.
  if (CLEAN && existsSync(OUT_DIR)) {
    await rm(OUT_DIR, { recursive: true, force: true });
    console.log(`  cleaned ${OG_PREFIX}/`);
  }

  const jobs = buildJobs();
  if (jobs.length === 0) {
    console.log("generate-og: no cards to render");
    return;
  }

  const concurrency = CONCURRENCY || DEFAULT_CONCURRENCY;
  const failures: Array<{ outPath: string; error: string }> = [];
  const byKind = new Map<OgKind, number>();
  const started = Date.now();
  let rendered = 0;
  let skipped = 0;

  for (const job of jobs) byKind.set(job.kind, (byKind.get(job.kind) ?? 0) + 1);

  console.log(
    `generate-og: ${jobs.length} card${jobs.length === 1 ? "" : "s"}` +
      `${LIMIT > 0 ? ` (--limit=${LIMIT})` : ""}` +
      `${kindArg ? ` (--kind=${KINDS.join(",")})` : ""}` +
      `, concurrency ${concurrency}`
  );

  await pool(jobs, concurrency, async (job) => {
    const outPath = join(APP_DIR, "public", job.outPath);
    try {
      if (!FORCE && existsSync(outPath)) {
        skipped += 1;
        return;
      }
      await mkdir(dirname(outPath), { recursive: true });
      await renderOgCard(job.input, outPath, CARD_OPTIONS);
      rendered += 1;
    } catch (error) {
      failures.push({
        outPath: job.outPath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  const perKind = [...byKind.entries()]
    .map(([kind, n]) => `${kind} ${n}`)
    .join(", ");
  console.log(`  jobs: ${perKind}`);
  console.log(
    `  rendered ${rendered}${skipped > 0 ? `, skipped ${skipped} already present` : ""}` +
      `, failed ${failures.length} in ${elapsed}s`
  );

  if (failures.length > 0) {
    console.warn(
      `generate-og: ${failures.length} card(s) failed — those pages will 404 their og:image.`
    );
    for (const f of failures.slice(0, 10)) console.warn(`  ${f.outPath}: ${f.error}`);
    if (failures.length > 10) console.warn(`  …and ${failures.length - 10} more`);
  }
}

await main();
