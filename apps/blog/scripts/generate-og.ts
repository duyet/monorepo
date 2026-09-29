#!/usr/bin/env tsx
/**
 * Prebuild script: renders the Open Graph / Twitter card for every page that
 * has its own image.
 *
 * Output is a flat set of 1200×630 PNGs in `public/og/`:
 *
 *   og/2026-09-i-dont-read-code-anymore.png   one per post (incl. child posts)
 *   og/note-ax.png                            one per quick note
 *   og/index.png                              the site-wide default card
 *
 * Route `head()` functions point `og:image` at exactly these paths — the
 * mapping is shared via `lib/og.ts` so the two can never drift.
 *
 * Why generate at build time rather than check the PNGs in: 319 posts means
 * ~330 cards, and a card has to exist before a crawler ever asks for it. The
 * renderer is deterministic (same inputs -> byte-identical PNG), so a rebuild
 * over unchanged content is skipped entirely by the hash cache below — which
 * is what keeps 224 remote thumbnail fetches off every build but the first.
 *
 * Usage:
 *   tsx scripts/generate-og.ts                  full run (what prebuild does)
 *   tsx scripts/generate-og.ts --limit=5        first 5 posts, for iteration
 *   tsx scripts/generate-og.ts --only=<slug>    a single post (last segment ok)
 *   tsx scripts/generate-og.ts --only=index,notes
 *   tsx scripts/generate-og.ts --force          ignore the cache, re-render all
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { LIGHT_THEME, type CardInput, renderOgCard } from "@duyet/config/og-card";
import {
  OG_INDEX_CARD,
  OG_SITE_NAME,
  ogCardPath,
  ogNoteCardPath,
} from "../lib/og";
import {
  parseFrontmatter,
  shortformId,
  toExcerpt,
} from "../lib/shortform-parse";

const APP_DIR = join(import.meta.dirname!, "..");
const PUBLIC_DIR = join(APP_DIR, "public");
const OG_DIR = join(PUBLIC_DIR, "og");
const SHORTFORMS_DIR = join(APP_DIR, "_shortforms");
const POSTS_DATA = join(PUBLIC_DIR, "posts-data.json");
const CACHE_FILE = join(APP_DIR, ".og-cache.json");

/**
 * Bumped when the card *look* changes, so stale cards re-render even when the
 * post metadata did not. Tracks the visual language of
 * `packages/config/src/og-card.ts`.
 */
const RENDERER_VERSION = "blog-og-1";

/** A card that has not resolved in this long is abandoned and retried next build. */
const CARD_DEADLINE_MS = 90_000;

/** Parallel card renders. 224 of 319 posts dither a remote thumbnail. */
const CONCURRENCY = 8;

// ── CLI flags ─────────────────────────────────────────────────────────────────

type Flags = { only: string[]; limit: number | null; force: boolean };

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { only: [], limit: null, force: false };
  for (const arg of argv) {
    // `pnpm run generate-og -- --limit=5` forwards a bare `--` separator.
    if (arg === "--") continue;
    const [key, value] = arg.replace(/^--/, "").split("=");
    switch (key) {
      case "only":
        flags.only.push(
          ...(value ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        );
        break;
      case "limit": {
        const parsed = Number.parseInt(value ?? "", 10);
        if (Number.isNaN(parsed) || parsed < 0) {
          throw new Error(`--limit expects a non-negative integer, got "${value}"`);
        }
        flags.limit = parsed;
        break;
      }
      case "force":
        flags.force = true;
        break;
      default:
        throw new Error(`Unknown flag: ${arg} (expected --only=, --limit=, --force)`);
    }
  }
  return flags;
}

// ── Post shape ───────────────────────────────────────────────────────────────

/**
 * Subset of `Post` we read off disk. `posts-data.json` is plain JSON, so dates
 * arrive as ISO strings rather than the `Date` the TS interface declares, and
 * the description field has been spelled both ways over the years — read both.
 */
type RawPost = {
  slug: string;
  title?: string;
  date?: string;
  category?: string;
  tags?: string[];
  series?: string;
  excerpt?: string;
  description?: string;
  readingTime?: number;
  thumbnail?: string;
  parent?: string;
};

type Card = {
  /** Output path, absolute on disk. */
  out: string;
  /** Public URL path, e.g. `/og/2026-09-foo.png`. */
  path: string;
  input: CardInput;
};

// ── Card content helpers ──────────────────────────────────────────────────────

/** Flatten the inline markdown that leaks out of excerpts into card prose. */
function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** `2026-09-26T00:00:00.000Z` -> `Sep 26, 2026`. UTC, so no off-by-one east/west. */
function formatDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** `Sep 26, 2026 · 5 min read`, degrading gracefully when either half is missing. */
function formatMeta(post: RawPost): string | undefined {
  const date = formatDate(post.date);
  const read =
    typeof post.readingTime === "number" ? `${post.readingTime} min read` : undefined;
  return [date, read].filter(Boolean).join(" · ") || undefined;
}

/** `AI · AI Harness Engineering` — category first, then series when there is one. */
function formatEyebrow(post: RawPost): string | undefined {
  return [post.category, post.series].filter(Boolean).join(" · ") || undefined;
}

/** Last slug segment, de-hyphenated — the fallback when a post has no title. */
function titleFromSlug(slug: string): string {
  const last = slug.split("/").filter(Boolean).pop() ?? slug;
  return last.replace(/-/g, " ");
}

/**
 * Resolve a `thumbnail` to something `renderOgCard` can read: remote URLs pass
 * through untouched, site-relative `/media/...` paths resolve against `public/`,
 * and anything else is dropped so the card falls back to type-only rather than
 * embedding a reference to a file that is not there.
 */
function resolveThumbnail(thumbnail: string | undefined): string | undefined {
  if (!thumbnail) return undefined;
  if (/^https?:\/\//i.test(thumbnail)) return thumbnail;
  if (thumbnail.startsWith("/")) {
    const local = join(PUBLIC_DIR, thumbnail.replace(/^\/+/, ""));
    return existsSync(local) ? local : undefined;
  }
  return undefined;
}

function postCard(post: RawPost): Card {
  return {
    out: join(PUBLIC_DIR, ogCardPath(post.slug).replace(/^\/+/, "")),
    path: ogCardPath(post.slug),
    input: {
      title: post.title?.trim() || titleFromSlug(post.slug),
      eyebrow: formatEyebrow(post),
      description: stripMarkdown(post.excerpt || post.description || ""),
      meta: formatMeta(post),
      siteName: OG_SITE_NAME,
      image: resolveThumbnail(post.thumbnail),
    },
  };
}

// ── Sources ───────────────────────────────────────────────────────────────────

function readPosts(): RawPost[] {
  if (!existsSync(POSTS_DATA)) {
    throw new Error(
      `Missing ${POSTS_DATA}. Run \`tsx scripts/generate-posts-data.ts\` first.`,
    );
  }
  return JSON.parse(readFileSync(POSTS_DATA, "utf-8")) as RawPost[];
}

type Note = { id: string; title: string; date: string; excerpt: string };

/**
 * Quick notes, read straight from `_shortforms/` with the same parser the
 * static-file generator uses — so note ids match the live `/note/$id` routes
 * without depending on `public/notes-data.json` having been generated first.
 *
 * The filtering mirrors `lib/shortforms.ts` exactly (`*.md` at the top level,
 * skip `README.md`, skip anything without a valid `date:`): a note the live
 * router 404s on must not get a card.
 */
async function readNotes(): Promise<Note[]> {
  let files: string[];
  try {
    files = (await readdir(SHORTFORMS_DIR)).filter(
      (f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md",
    );
  } catch {
    return [];
  }

  const notes: Note[] = [];
  for (const file of files) {
    const raw = await readFile(join(SHORTFORMS_DIR, file), "utf-8");
    const { date, title, slug, body } = parseFrontmatter(raw);
    if (Number.isNaN(new Date(date).getTime())) continue;
    const id = shortformId(file.replace(/\.md$/, ""), slug);
    notes.push({
      id,
      title: title?.trim() || id.replace(/-/g, " "),
      date,
      excerpt: toExcerpt(body),
    });
  }
  return notes.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * The site-wide card: the "minimal hairline" type-only style, no dither
 * background. The counts come from the same `posts-data.json` the rest of the
 * site is built on, so they cannot go stale in a comment.
 */
function indexCard(posts: RawPost[]): Card {
  const years = posts
    .map((p) => (p.date ? new Date(p.date).getUTCFullYear() : Number.NaN))
    .filter((y) => !Number.isNaN(y));
  const since = years.length > 0 ? String(Math.min(...years)) : undefined;

  return {
    out: join(PUBLIC_DIR, OG_INDEX_CARD.replace(/^\/+/, "")),
    path: OG_INDEX_CARD,
    input: {
      title: "Tôi là Duyệt",
      eyebrow: "Blog",
      description:
        "Notes on data engineering, distributed systems, Rust, and — lately — AI agents.",
      meta: [`${posts.length} posts`, since && `since ${since}`]
        .filter(Boolean)
        .join(" · "),
      siteName: OG_SITE_NAME,
    },
  };
}

function noteCard(note: Note): Card {
  return {
    out: join(PUBLIC_DIR, ogNoteCardPath(note.id).replace(/^\/+/, "")),
    path: ogNoteCardPath(note.id),
    input: {
      title: note.title || note.id,
      eyebrow: "Quick Note",
      description: stripMarkdown(note.excerpt),
      meta: formatDate(note.date),
      siteName: OG_SITE_NAME,
    },
  };
}

// ── Rendering ─────────────────────────────────────────────────────────────────

type CacheEntry = { hash: string; usedImage: boolean };
type Cache = Record<string, CacheEntry>;
type Outcome = { card: Card; status: "written" | "cached"; usedImage: boolean };

/** Hash of everything that can change a card's pixels. */
function cardHash(card: Card): string {
  return createHash("sha256")
    .update(RENDERER_VERSION)
    .update("\0")
    .update(JSON.stringify(card.input))
    .update("\0")
    .update(JSON.stringify(LIGHT_THEME))
    .digest("hex")
    .slice(0, 32);
}

async function render(card: Card, cache: Cache, force: boolean): Promise<Outcome> {
  const hash = cardHash(card);
  const hit = cache[card.path];
  if (!force && hit?.hash === hash && existsSync(card.out)) {
    return { card, status: "cached", usedImage: hit.usedImage };
  }

  // `renderOgCard` already retries and times out internally; this is the outer
  // backstop so one pathological host cannot stall the whole prebuild. A card
  // that blows the deadline is simply left uncached for the next build.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`timed out after ${CARD_DEADLINE_MS}ms`)),
      CARD_DEADLINE_MS,
    );
    timer.unref?.();
  });

  let rendered: Awaited<ReturnType<typeof renderOgCard>>;
  try {
    rendered = await Promise.race([
      renderOgCard(card.input, card.out, { theme: LIGHT_THEME }),
      deadline,
    ]);
  } finally {
    clearTimeout(timer);
  }

  cache[card.path] = { hash, usedImage: rendered.usedImage };
  return { card, status: "written", usedImage: rendered.usedImage };
}

type Settled<R> = { ok: true; value: R } | { ok: false; error: string };

/**
 * Run `worker` over `items` with a bounded pool. Every item settles
 * independently — one failure is recorded and the run continues, because a
 * single dead image host must never fail the blog build.
 */
async function pool<T, R>(
  items: T[],
  size: number,
  worker: (item: T) => Promise<R>,
): Promise<Array<Settled<R>>> {
  const results = new Array<Settled<R>>(items.length);
  let cursor = 0;

  const runners = Array.from(
    { length: Math.min(size, items.length) },
    async () => {
      for (;;) {
        const index = cursor++;
        if (index >= items.length) return;
        try {
          results[index] = { ok: true, value: await worker(items[index]!) };
        } catch (error) {
          results[index] = {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }
    },
  );

  await Promise.all(runners);
  return results;
}

// ── Selection ─────────────────────────────────────────────────────────────────

/** Accept `/2026/09/slug`, `2026/09/slug`, or just the last segment. */
function matchesToken(post: RawPost, token: string): boolean {
  const slug = post.slug.replace(/^\/+/, "").replace(/\.(md|mdx|html)$/i, "");
  const wanted = token.replace(/^\/+/, "").replace(/\.(md|mdx|html)$/i, "");
  if (!wanted) return false;
  if (slug === wanted) return true;
  return wanted === slug.split("/").filter(Boolean).pop();
}

function selectPosts(posts: RawPost[], flags: Flags): RawPost[] {
  const cap = (list: RawPost[]): RawPost[] =>
    flags.limit === null ? list : list.slice(0, flags.limit);

  if (flags.only.length === 0) return cap(posts);

  const postTokens = flags.only.filter(
    (token) => token !== "index" && token !== "notes",
  );
  if (postTokens.length === 0) return [];

  const selected = posts.filter((post) =>
    postTokens.some((token) => matchesToken(post, token)),
  );
  if (selected.length === 0) {
    throw new Error(`--only matched no posts: ${postTokens.join(", ")}`);
  }
  return cap(selected);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const posts = readPosts();
  const notes = await readNotes();

  // `--force` only means "ignore the cache"; it must not widen the selection,
  // or `generate-og --force --only=<slug>` would re-render the whole site.
  const unrestricted = flags.only.length === 0;
  const wantsIndex = unrestricted || flags.only.includes("index");
  const wantsNotes = unrestricted || flags.only.includes("notes");

  const cards: Card[] = [];
  if (wantsIndex) cards.push(indexCard(posts));
  if (wantsNotes) {
    for (const note of notes) cards.push(noteCard(note));
  }
  for (const post of selectPosts(posts, flags)) cards.push(postCard(post));

  let cache: Cache = {};
  if (!flags.force && existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(await readFile(CACHE_FILE, "utf-8")) as Cache;
    } catch {
      cache = {};
    }
  }

  await mkdir(OG_DIR, { recursive: true });

  console.log(
    `Generating OG cards: ${cards.length} targets` +
      (flags.only.length > 0 ? ` (--only=${flags.only.join(",")})` : "") +
      (flags.limit === null ? "" : ` (--limit=${flags.limit})`),
  );

  const started = Date.now();
  const results = await pool(cards, CONCURRENCY, (card) =>
    render(card, cache, flags.force),
  );

  // Persist hashes only for cards that actually landed on disk.
  const nextCache: Cache = { ...cache };
  const failures: Array<[string, string]> = [];
  let written = 0;
  let cached = 0;
  let dithered = 0;
  for (let i = 0; i < results.length; i++) {
    const result = results[i]!;
    if (!result.ok) {
      failures.push([cards[i]!.path, result.error]);
      continue;
    }
    if (result.value.status === "cached") cached++;
    else written++;
    if (result.value.usedImage) dithered++;
    nextCache[result.value.card.path] = {
      hash: cardHash(result.value.card),
      usedImage: result.value.usedImage,
    };
  }
  await writeFile(CACHE_FILE, `${JSON.stringify(nextCache, null, 2)}\n`, "utf-8");

  // A full run is authoritative for the contents of public/og: drop cards for
  // posts/notes that no longer exist, or their stale PNGs ship to every
  // visitor forever. Filtered runs never prune.
  let pruned = 0;
  if (unrestricted) {
    const keep = new Set(cards.map((c) => c.out));
    for (const file of await readdir(OG_DIR)) {
      if (!file.endsWith(".png")) continue;
      const full = join(OG_DIR, file);
      if (keep.has(full)) continue;
      await rm(full);
      for (const key of Object.keys(nextCache)) {
        if (nextCache[key] && keep.has(join(PUBLIC_DIR, key.replace(/^\/+/, "")))) {
          delete nextCache[key];
        }
      }
      pruned++;
    }
    if (pruned > 0) {
      await writeFile(CACHE_FILE, `${JSON.stringify(nextCache, null, 2)}\n`, "utf-8");
    }
  }

  console.log(
    `  ✓ ${written} written, ${cached} cached, ${pruned} pruned ` +
      `(${((Date.now() - started) / 1000).toFixed(1)}s)`,
  );
  console.log(
    `  ✓ ${dithered} dithered, ${written + cached - dithered} type-only fallback`,
  );

  if (failures.length > 0) {
    // A warning, not an exit code: an unreachable image host degrades one card
    // to type-only, it does not break the build.
    console.warn(`  ! ${failures.length} card(s) failed:`);
    for (const [path, error] of failures) console.warn(`      ${path}: ${error}`);
  }

  console.log("OG card generation complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
