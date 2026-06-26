#!/usr/bin/env tsx
/**
 * GitHub stats fetch + cache + chart/share-card generator.
 *
 * Pulls the data used in the "AI Harness Engineering" posts:
 *   1. Monthly GitHub contributions for one or more accounts (merged into one
 *      series), broken down by type — commits, pull requests, code reviews,
 *      issues, and private/restricted work — via the GitHub GraphQL API
 *      (`contributionsCollection`). Rendered as a stacked-bar share card with a
 *      big "Goal and Loop" title, in light and dark themes (SVG + PNG).
 *   2. Merged-PR counts per quarter for a repo, via the GitHub search API.
 *
 * Everything is cached to a committed JSON file so charts regenerate offline.
 * Re-run with `--update` to refetch from GitHub and refresh the cache.
 *
 * A token is required for the GraphQL breakdown. Provide one via GITHUB_TOKEN
 * or GH_TOKEN (e.g. `GITHUB_TOKEN=$(gh auth token)`); private contributions
 * are only visible to the account's own token.
 *
 * Usage:
 *   GITHUB_TOKEN=$(gh auth token) tsx scripts/github-stats.ts --update
 *   tsx scripts/github-stats.ts            # rebuild cards from cache
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

// ---- config ---------------------------------------------------------------
const ACCOUNTS = ["duyet", "duyetbot"]; // contributions merged across these
const REPO = "duyet/clickhouse-monitoring"; // PR activity source
const START_YEAR = 2018;
const LAUNCH = { ym: "2025-02", label: "Claude Code launched" }; // marker
const NOW = new Date();
const END_YEAR = NOW.getUTCFullYear();
const END_MONTH = NOW.getUTCMonth() + 1; // 1-based; current month is partial
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

const HERE = import.meta.dirname!;
const CACHE = join(HERE, "github-stats.cache.json");
const OUT_DIR = join(HERE, "..", "public", "media", "2026", "06", "goal-and-loop");

// Contribution types, drawn bottom→top in the stacked bars.
const TYPES = [
  { key: "commits", label: "Commits" },
  { key: "prs", label: "Pull requests" },
  { key: "reviews", label: "Reviews" },
  { key: "issues", label: "Issues" },
  { key: "private", label: "Private" },
] as const;
type TypeKey = (typeof TYPES)[number]["key"];

type MonthRow = { ym: string } & Record<TypeKey, number> & { v: number };
type Cache = {
  updatedAt: string;
  contributions: { accounts: string[]; types: string[]; monthly: MonthRow[] };
  prs: { repo: string; quarterly: { q: string; v: number }[]; total: number };
};

type Theme = {
  name: string;
  bg: string;
  ink: string;
  accent: string;
  type: Record<TypeKey, string>;
};

const THEMES: Theme[] = [
  {
    name: "light",
    bg: "#f8f8f2",
    ink: "#1a1a1a",
    accent: "#d97441",
    type: { commits: "#1a1a1a", prs: "#d97441", reviews: "#5b7c99", issues: "#b8893a", private: "#cfc9bb" },
  },
  {
    name: "dark",
    bg: "#1a1a1a",
    ink: "#f5f3ec",
    accent: "#e0875a",
    type: { commits: "#d8d5cc", prs: "#e0875a", reviews: "#6f97b8", issues: "#c79a4f", private: "#57544c" },
  },
];

// ---- fetch helpers --------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function gql<T>(query: string): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "User-Agent": "duyet-github-stats",
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`graphql ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) throw new Error(`graphql errors: ${JSON.stringify(json.errors)}`);
  return json.data as T;
}

const FIELDS = `
  totalCommitContributions
  totalPullRequestContributions
  totalPullRequestReviewContributions
  totalIssueContributions
  restrictedContributionsCount`;

type Coll = {
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
  totalIssueContributions: number;
  restrictedContributionsCount: number;
};

// Fetch a whole year of monthly type-breakdowns for one account in a single
// aliased query (m1..m12). The current month's window ends at "now".
async function fetchYearTyped(user: string, year: number): Promise<Record<string, Coll>> {
  const lastMo = year === END_YEAR ? END_MONTH : 12;
  const segs: string[] = [];
  for (let mo = 1; mo <= lastMo; mo++) {
    const mm = String(mo).padStart(2, "0");
    const from = `${year}-${mm}-01T00:00:00Z`;
    const endDay = new Date(Date.UTC(year, mo, 0)).getUTCDate();
    const isCurrent = year === END_YEAR && mo === END_MONTH;
    const to = isCurrent
      ? NOW.toISOString()
      : `${year}-${mm}-${String(endDay).padStart(2, "0")}T23:59:59Z`;
    segs.push(`m${mo}: contributionsCollection(from:"${from}", to:"${to}"){${FIELDS}}`);
  }
  const data = await gql<{ user: Record<string, Coll> }>(
    `query{ user(login:"${user}"){ ${segs.join("\n")} } }`,
  );
  return data.user;
}

async function fetchQuarterMergedPRs(repo: string, year: number, q: number): Promise<number> {
  const startM = (q - 1) * 3 + 1;
  const endM = startM + 2;
  const endDay = new Date(Date.UTC(year, endM, 0)).getUTCDate();
  const from = `${year}-${String(startM).padStart(2, "0")}-01`;
  const to = `${year}-${String(endM).padStart(2, "0")}-${endDay}`;
  const q1 = `repo:${repo}+type:pr+is:merged+created:${from}..${to}`;
  const url = `https://api.github.com/search/issues?q=${q1}&per_page=1`;
  const headers: Record<string, string> = { "User-Agent": "duyet-github-stats" };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(url, { headers });
  if (res.status === 403) { await sleep(20000); return fetchQuarterMergedPRs(repo, year, q); }
  if (!res.ok) throw new Error(`prs ${repo} ${year}Q${q}: ${res.status}`);
  return (await res.json()).total_count as number;
}

async function fetchTotalPRs(repo: string): Promise<number> {
  const url = `https://api.github.com/search/issues?q=repo:${repo}+type:pr&per_page=1`;
  const headers: Record<string, string> = { "User-Agent": "duyet-github-stats" };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(url, { headers });
  return res.ok ? ((await res.json()).total_count as number) : 0;
}

// ---- update ---------------------------------------------------------------
async function update(): Promise<Cache> {
  if (!TOKEN) throw new Error("GITHUB_TOKEN or GH_TOKEN required for --update");

  const byYm: Record<string, MonthRow> = {};
  const blank = (ym: string): MonthRow => ({
    ym, commits: 0, prs: 0, reviews: 0, issues: 0, private: 0, v: 0,
  });
  for (const acct of ACCOUNTS) {
    for (let y = START_YEAR; y <= END_YEAR; y++) {
      const year = await fetchYearTyped(acct, y);
      let sum = 0;
      for (const [alias, c] of Object.entries(year)) {
        const mo = Number(alias.slice(1));
        const ym = `${y}-${String(mo).padStart(2, "0")}`;
        byYm[ym] ??= blank(ym);
        const row = byYm[ym];
        row.commits += c.totalCommitContributions;
        row.prs += c.totalPullRequestContributions;
        row.reviews += c.totalPullRequestReviewContributions;
        row.issues += c.totalIssueContributions;
        row.private += c.restrictedContributionsCount;
        sum += c.totalCommitContributions + c.totalPullRequestContributions +
          c.totalPullRequestReviewContributions + c.totalIssueContributions +
          c.restrictedContributionsCount;
      }
      await sleep(300);
      console.log(`  contributions ${acct} ${y}: ${sum}`);
    }
  }
  const monthly: MonthRow[] = [];
  for (let y = START_YEAR; y <= END_YEAR; y++)
    for (let mo = 1; mo <= 12; mo++) {
      if (y === END_YEAR && mo > END_MONTH) continue;
      const ym = `${y}-${String(mo).padStart(2, "0")}`;
      const row = byYm[ym] ?? blank(ym);
      row.v = row.commits + row.prs + row.reviews + row.issues + row.private;
      monthly.push(row);
    }

  const quarterly: { q: string; v: number }[] = [];
  for (let y = START_YEAR; y <= END_YEAR; y++)
    for (let q = 1; q <= 4; q++) {
      if (y === END_YEAR && (q - 1) * 3 + 1 > END_MONTH) continue;
      const v = await fetchQuarterMergedPRs(REPO, y, q);
      await sleep(800);
      if (v > 0 || quarterly.length) quarterly.push({ q: `${y}-Q${q}`, v });
    }
  const total = await fetchTotalPRs(REPO);

  const cache: Cache = {
    updatedAt: new Date().toISOString(),
    contributions: { accounts: ACCOUNTS, types: TYPES.map((t) => t.key), monthly },
    prs: { repo: REPO, quarterly, total },
  };
  writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  console.log(`cache written: ${CACHE}`);
  return cache;
}

// ---- chart generators -----------------------------------------------------
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const kfmt = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v));
const op = (hex: string, o: number) => `fill="${hex}" fill-opacity="${o}"`;

function niceStep(maxPerTick: number): number {
  return [500, 1000, 2000, 2500, 5000, 10000, 20000].find((c) => c >= maxPerTick) ?? 20000;
}

// A vertical bar with rounded top corners (baseline corners stay square).
function barPath(bx: number, by: number, w: number, h: number, r: number): string {
  const rad = Math.max(0, Math.min(r, w / 2, h));
  const base = by + h;
  return `M${bx.toFixed(1)},${base.toFixed(1)} L${bx.toFixed(1)},${(by + rad).toFixed(1)} Q${bx.toFixed(1)},${by.toFixed(1)} ${(bx + rad).toFixed(1)},${by.toFixed(1)} L${(bx + w - rad).toFixed(1)},${by.toFixed(1)} Q${(bx + w).toFixed(1)},${by.toFixed(1)} ${(bx + w).toFixed(1)},${(by + rad).toFixed(1)} L${(bx + w).toFixed(1)},${base.toFixed(1)} Z`;
}

// 1200x630 share card: big serif "Goal and Loop" title + rounded monthly bars.
function shareCard(c: Cache, th: Theme): string {
  const d = c.contributions.monthly;
  const W = 1200, H = 630, P = 64;
  const L = P, R = W - P, TOP = 190, BASE = 538;
  const n = d.length, slot = (R - L) / n, bw = slot * 0.62;
  const mx = Math.max(...d.map((x) => x.v), 1);
  const sc = (BASE - TOP) / mx;
  const x = (i: number) => L + slot * i + (slot - bw) / 2;
  const p: string[] = [];

  p.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Inter, ui-sans-serif, system-ui, sans-serif" role="img">`);
  p.push(`<title>Goal and Loop — @duyet GitHub activity over the years, ${d[0].ym} to ${d[d.length - 1].ym}.</title>`);
  p.push(`<rect width="${W}" height="${H}" fill="${th.bg}"/>`);

  // title (serif display face for editorial contrast against the sans chrome)
  p.push(`<text x="${P}" y="132" font-family="Georgia, 'Times New Roman', serif" font-size="80" font-weight="700" letter-spacing="-1" xml:space="preserve"><tspan fill="${th.ink}">Goal and </tspan><tspan fill="${th.accent}">Loop</tspan></text>`);

  // gridlines
  const step = niceStep(mx / 4);
  for (let gv = step; gv <= mx; gv += step) {
    const gy = BASE - gv * sc;
    p.push(`<line x1="${L}" y1="${gy.toFixed(1)}" x2="${R}" y2="${gy.toFixed(1)}" stroke="${th.ink}" stroke-opacity="0.10"/>`);
    p.push(`<text x="${L - 6}" y="${(gy + 3).toFixed(1)}" font-size="10" ${op(th.ink, 0.4)} text-anchor="end">${kfmt(gv)}</text>`);
  }
  p.push(`<line x1="${L}" y1="${BASE}" x2="${R}" y2="${BASE}" stroke="${th.ink}" stroke-opacity="0.25"/>`);

  // bars — all contributions merged into one rounded bar per month. Bars from
  // the Claude Code launch onward are accent-coloured to show the goal+loop era.
  let li = -1;
  d.forEach((row, i) => {
    const h = row.v * sc, bx = x(i), by = BASE - h;
    const col = row.ym >= LAUNCH.ym ? th.accent : th.ink;
    p.push(`<path d="${barPath(bx, by, bw, h, 3.5)}" fill="${col}"/>`);
    if (row.ym === LAUNCH.ym) li = i;
  });

  // launch marker
  if (li >= 0) {
    const mlx = x(li) - 2;
    p.push(`<line x1="${mlx.toFixed(1)}" y1="${TOP}" x2="${mlx.toFixed(1)}" y2="${BASE}" stroke="${th.accent}" stroke-width="1.2" stroke-dasharray="4 3"/>`);
    p.push(`<circle cx="${mlx.toFixed(1)}" cy="${TOP}" r="3.2" fill="${th.accent}"/>`);
    p.push(`<text x="${(mlx - 7).toFixed(1)}" y="${TOP - 5}" font-size="12.5" fill="${th.accent}" font-weight="600" text-anchor="end">${esc(LAUNCH.label)}</text>`);
  }

  // year labels
  const years = [...new Set(d.map((r) => r.ym.slice(0, 4)))];
  for (const y of years) {
    const idx = d.map((r, i) => (r.ym.startsWith(y) ? i : -1)).filter((i) => i >= 0);
    const cx = (x(idx[0]) + x(idx[idx.length - 1]) + bw) / 2;
    p.push(`<text x="${cx.toFixed(1)}" y="566" font-size="11.5" ${op(th.ink, 0.7)} text-anchor="middle">${y}</text>`);
  }

  // footer — @duyet note moved here, with the post URL on the right
  p.push(`<text x="${P}" y="602" font-size="13" font-weight="600" ${op(th.ink, 0.6)}>@duyet · GitHub activity over the years</text>`);
  p.push(`<text x="${R}" y="602" font-size="12" ${op(th.ink, 0.45)} text-anchor="end">blog.duyet.net/2026/06/goal-and-loop</text>`);
  p.push(`</svg>`);
  return p.join("\n");
}

function prSvg(c: Cache): string {
  const d = c.prs.quarterly;
  const L = 70, R = 740, TOP = 80, BASE = 350;
  const n = d.length, slot = (R - L) / n, bw = slot * 0.62;
  const mx = Math.max(...d.map((x) => x.v), 1), sc = (BASE - TOP) / mx;
  const x = (i: number) => L + slot * i + (slot - bw) / 2;
  const p: string[] = [];
  p.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" font-family="Inter, ui-sans-serif, system-ui, sans-serif" role="img">`);
  p.push(`<title>Merged PRs per quarter for ${esc(c.prs.repo)}.</title>`);
  p.push(`<rect width="800" height="440" fill="#f8f8f2"/>`);
  p.push(`<text x="60" y="34" font-size="15" font-weight="700" fill="#1a1a1a">Merged PRs / quarter — ${esc(c.prs.repo)}</text>`);
  p.push(`<text x="60" y="52" font-size="11" fill="#1a1a1a" fill-opacity="0.55">~${c.prs.total.toLocaleString()} PRs total. Latest quarter partial.</text>`);
  p.push(`<line x1="64" y1="${BASE}" x2="${R}" y2="${BASE}" stroke="#1a1a1a" stroke-opacity="0.25"/>`);
  d.forEach((row, i) => {
    const h = row.v * sc, bx = x(i), by = BASE - h;
    const col = row.v >= 100 ? "#d97441" : "#1a1a1a";
    p.push(`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${col}"/>`);
    p.push(`<text x="${(bx + bw / 2).toFixed(1)}" y="${(by - 6).toFixed(1)}" font-size="9.5" fill="#1a1a1a" fill-opacity="0.7" text-anchor="middle">${row.v}</text>`);
    p.push(`<text x="${(bx + bw / 2).toFixed(1)}" y="366" font-size="8.5" fill="#1a1a1a" fill-opacity="0.5" text-anchor="middle">${row.q.slice(5)}</text>`);
  });
  const years = [...new Set(d.map((r) => r.q.slice(0, 4)))];
  for (const y of years) {
    const idx = d.map((r, i) => (r.q.startsWith(y) ? i : -1)).filter((i) => i >= 0);
    const cx = (x(idx[0]) + x(idx[idx.length - 1]) + bw) / 2;
    p.push(`<text x="${cx.toFixed(1)}" y="386" font-size="11" font-weight="600" fill="#1a1a1a" fill-opacity="0.8" text-anchor="middle">${y}</text>`);
  }
  p.push(`</svg>`);
  return p.join("\n");
}

async function renderPng(svg: string, outPath: string) {
  // density 144 → 2× the 1200×630 viewBox = 2400×1260, crisp for social cards.
  await sharp(Buffer.from(svg), { density: 144 }).png({ compressionLevel: 9 }).toFile(outPath);
}

// ---- main -----------------------------------------------------------------
async function main() {
  const refresh = process.argv.includes("--update");
  let cache: Cache;
  if (refresh || !existsSync(CACHE)) {
    console.log(refresh ? "Refetching from GitHub…" : "No cache; fetching…");
    cache = await update();
  } else {
    cache = JSON.parse(readFileSync(CACHE, "utf-8"));
    console.log(`Using cache from ${cache.updatedAt} (run with --update to refresh)`);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const light = THEMES[0], dark = THEMES[1];
  const lightSvg = shareCard(cache, light);
  const darkSvg = shareCard(cache, dark);
  // The committed thumbnail (light) keeps its existing filename.
  writeFileSync(join(OUT_DIR, "contributions.svg"), lightSvg);
  writeFileSync(join(OUT_DIR, "contributions-dark.svg"), darkSvg);
  await renderPng(lightSvg, join(OUT_DIR, "contributions-light.png"));
  await renderPng(darkSvg, join(OUT_DIR, "contributions-dark.png"));
  writeFileSync(join(OUT_DIR, "pr-activity.svg"), prSvg(cache));
  console.log(`Charts + share cards (svg/png, light/dark) written to ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
