#!/usr/bin/env tsx
/**
 * GitHub stats fetch + cache + chart generator.
 *
 * Pulls the data used in the "AI Harness Engineering" posts:
 *   1. Monthly GitHub contributions for one or more accounts (merged into one
 *      series), scraped from the public contributions calendar.
 *   2. Merged-PR counts per quarter for a repo, via the GitHub search API.
 *
 * Everything is cached to a committed JSON file so charts regenerate offline.
 * Re-run with `--update` to refetch from GitHub and refresh the cache.
 *
 * Usage:
 *   tsx scripts/github-stats.ts            # build charts from cache (fetch if empty)
 *   tsx scripts/github-stats.ts --update   # refetch everything, refresh cache
 *   GITHUB_TOKEN=ghp_xxx tsx scripts/github-stats.ts --update   # higher rate limits
 *
 * Config below (ACCOUNTS, REPO, START_YEAR, LAUNCH) drives what's fetched.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// ---- config ---------------------------------------------------------------
const ACCOUNTS = ["duyet", "duyetbot"]; // contributions merged across these
const REPO = "duyet/clickhouse-monitoring"; // PR activity source
const START_YEAR = 2018;
const LAUNCH = { ym: "2025-02", label: "Claude Code launched" }; // marker
const NOW = new Date();
const END_YEAR = NOW.getUTCFullYear();
const END_MONTH = NOW.getUTCMonth() + 1; // 1-based; current month is partial

const HERE = import.meta.dirname!;
const CACHE = join(HERE, "github-stats.cache.json");
const OUT_DIR = join(HERE, "..", "public", "media", "2026", "06", "goal-and-loop");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Cache = {
  updatedAt: string;
  contributions: { accounts: string[]; monthly: { ym: string; v: number }[] };
  prs: { repo: string; quarterly: { q: string; v: number }[]; total: number };
};

// ---- fetch helpers --------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchYearMonthly(user: string, year: number): Promise<number[]> {
  // The contributions calendar returns the whole year; we sum days by month.
  const url = `https://github.com/users/${user}/contributions?from=${year}-01-01&to=${year}-12-31`;
  const res = await fetch(url, { headers: { "User-Agent": "duyet-github-stats" } });
  if (!res.ok) throw new Error(`contributions ${user} ${year}: ${res.status}`);
  const html = await res.text();
  const out = new Array(12).fill(0);
  const re = /(\d+)\s+contributions?\s+on\s+(\w+)/g;
  let m = re.exec(html);
  while (m !== null) {
    const idx = MONTHS.indexOf(m[2]);
    if (idx >= 0) out[idx] += Number(m[1]);
    m = re.exec(html);
  }
  return out;
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
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (res.status === 403) { await sleep(20000); return fetchQuarterMergedPRs(repo, year, q); }
  if (!res.ok) throw new Error(`prs ${repo} ${year}Q${q}: ${res.status}`);
  return (await res.json()).total_count as number;
}

async function fetchTotalPRs(repo: string): Promise<number> {
  const url = `https://api.github.com/search/issues?q=repo:${repo}+type:pr&per_page=1`;
  const headers: Record<string, string> = { "User-Agent": "duyet-github-stats" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  return res.ok ? ((await res.json()).total_count as number) : 0;
}

// ---- update ---------------------------------------------------------------
async function update(): Promise<Cache> {
  // contributions: merge accounts by month
  const monthly: { ym: string; v: number }[] = [];
  const byYearMonth: Record<string, number> = {};
  for (const acct of ACCOUNTS) {
    for (let y = START_YEAR; y <= END_YEAR; y++) {
      const ms = await fetchYearMonthly(acct, y);
      ms.forEach((v, i) => {
        const ym = `${y}-${String(i + 1).padStart(2, "0")}`;
        byYearMonth[ym] = (byYearMonth[ym] ?? 0) + v;
      });
      await sleep(300);
      console.log(`  contributions ${acct} ${y}: ${ms.reduce((a, b) => a + b, 0)}`);
    }
  }
  for (let y = START_YEAR; y <= END_YEAR; y++)
    for (let mo = 1; mo <= 12; mo++) {
      if (y === END_YEAR && mo > END_MONTH) continue;
      const ym = `${y}-${String(mo).padStart(2, "0")}`;
      monthly.push({ ym, v: byYearMonth[ym] ?? 0 });
    }

  // PRs: per quarter
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
    contributions: { accounts: ACCOUNTS, monthly },
    prs: { repo: REPO, quarterly, total },
  };
  writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  console.log(`cache written: ${CACHE}`);
  return cache;
}

// ---- chart generators -----------------------------------------------------
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function contributionsSvg(c: Cache): string {
  const d = c.contributions.monthly;
  const L = 60, R = 980, TOP = 70, BASE = 380;
  const n = d.length, slot = (R - L) / n, bw = slot * 0.74;
  const mx = Math.max(...d.map((x) => x.v), 1), sc = (BASE - TOP) / mx;
  const x = (i: number) => L + slot * i + (slot - bw) / 2;
  const p: string[] = [];
  p.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 440" font-family="Inter, ui-sans-serif, system-ui, sans-serif" role="img">`);
  p.push(`<title>GitHub contributions per month, ${d[0].ym} to ${d[d.length - 1].ym}.</title>`);
  p.push(`<rect width="1000" height="440" fill="#f8f8f2"/>`);
  p.push(`<text x="60" y="34" font-size="16" font-weight="700" fill="#1a1a1a">GitHub contributions per month</text>`);
  p.push(`<text x="60" y="53" font-size="11" fill="#1a1a1a" fill-opacity="0.55">All repositories, ${d[0].ym} – ${d[d.length - 1].ym}. Latest month partial.</text>`);
  for (const gv of [2000, 4000]) {
    if (gv > mx) continue;
    const gy = BASE - gv * sc;
    p.push(`<line x1="${L}" y1="${gy.toFixed(1)}" x2="${R}" y2="${gy.toFixed(1)}" stroke="#1a1a1a" stroke-opacity="0.10"/>`);
    p.push(`<text x="${L - 4}" y="${(gy + 3).toFixed(1)}" font-size="9" fill="#1a1a1a" fill-opacity="0.4" text-anchor="end">${gv / 1000}k</text>`);
  }
  p.push(`<line x1="${L}" y1="${BASE}" x2="${R}" y2="${BASE}" stroke="#1a1a1a" stroke-opacity="0.25"/>`);
  let li = -1;
  d.forEach((row, i) => {
    const h = row.v * sc, bx = x(i), by = BASE - h;
    const col = row.ym >= LAUNCH.ym ? "#d97441" : "#1a1a1a";
    p.push(`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${col}"/>`);
    if (row.ym === LAUNCH.ym) li = i;
  });
  if (li >= 0) {
    const lx = x(li) - 1;
    p.push(`<line x1="${lx.toFixed(1)}" y1="${TOP}" x2="${lx.toFixed(1)}" y2="${BASE}" stroke="#d97441" stroke-width="1.2" stroke-dasharray="4 3"/>`);
    p.push(`<circle cx="${lx.toFixed(1)}" cy="${TOP}" r="3" fill="#d97441"/>`);
    p.push(`<text x="${(lx - 6).toFixed(1)}" y="${TOP - 4}" font-size="10.5" fill="#d97441" font-weight="600" text-anchor="end">${esc(LAUNCH.label)}</text>`);
  }
  const last = d[d.length - 1];
  p.push(`<text x="${(x(d.length - 1) + bw / 2).toFixed(1)}" y="${(BASE - last.v * sc - 5).toFixed(1)}" font-size="10" font-weight="700" fill="#1a1a1a" text-anchor="middle">${(last.v / 1000).toFixed(1)}k</text>`);
  const years = [...new Set(d.map((r) => r.ym.slice(0, 4)))];
  for (const y of years) {
    const idx = d.map((r, i) => (r.ym.startsWith(y) ? i : -1)).filter((i) => i >= 0);
    const cx = (x(idx[0]) + x(idx[idx.length - 1]) + bw) / 2;
    p.push(`<text x="${cx.toFixed(1)}" y="400" font-size="10.5" fill="#1a1a1a" fill-opacity="0.7" text-anchor="middle">${y}</text>`);
  }
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
  writeFileSync(join(OUT_DIR, "contributions.svg"), contributionsSvg(cache));
  writeFileSync(join(OUT_DIR, "pr-activity.svg"), prSvg(cache));
  console.log(`Charts written to ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
