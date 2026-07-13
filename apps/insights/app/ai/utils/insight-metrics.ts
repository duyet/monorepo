/**
 * Rich insight metrics derived directly from the DuckDB analytics cache.
 *
 * These queries mirror the clickhouse-backed ones in `data-fetchers.ts` but read
 * the local / MotherDuck cache that ships with the static build, so the overview
 * page can surface more charts without a live ClickHouse round-trip. Every query
 * degrades to an empty array when the cache is missing or the table has no rows.
 */
import { executeDuckDBQuery } from "./duckdb-cache";
import type { DateRangeDays } from "../types";
import { getDuckDBDateCondition } from "./data-fetchers";

/* ----------------------------- Cache ratio ------------------------------ */

export interface CacheRatioPoint {
  date: string;
  /** Share of tokens served from cache (0–100). */
  pct: number;
  totalTokens: number;
  cacheTokens: number;
}

/**
 * Daily cache-hit ratio over the window — how much of the token volume was
 * satisfied by cache reads/creations rather than fresh inputs.
 */
export async function getCacheRatioTrend(
  days: DateRangeDays = 30
): Promise<CacheRatioPoint[]> {
  const where = getDuckDBDateCondition(days, "date");
  const rows = await executeDuckDBQuery(`
    SELECT
      CAST(date AS VARCHAR) AS date,
      SUM(total_tokens) AS total_tokens,
      SUM(cache_creation_tokens + cache_read_tokens) AS cache_tokens
    FROM ccusage_usage_daily
    ${where}
    GROUP BY date
    ORDER BY date ASC
  `);
  if (rows.length === 0) return [];
  return rows.map((r) => {
    const total = Number(r.total_tokens) || 0;
    const cache = Number(r.cache_tokens) || 0;
    return {
      date: String(r.date),
      totalTokens: total,
      cacheTokens: cache,
      pct: total > 0 ? Math.round((cache / total) * 1000) / 10 : 0,
    };
  });
}

/* --------------------------- Model cost share ---------------------------- */

export interface ModelCostShare {
  name: string;
  cost: number;
  tokens: number;
  /** Share of total cost (0–100), rounded to sum ~100. */
  pct: number;
}

/**
 * Per-model cost contribution for the window, for the pie/donut breakdown.
 */
export async function getModelCostShare(
  days: DateRangeDays = 30,
  limit = 6
): Promise<ModelCostShare[]> {
  const where = getDuckDBDateCondition(days, "created_at");
  const rows = await executeDuckDBQuery(`
    SELECT
      model_name AS name,
      SUM(cost) AS cost,
      SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) AS tokens
    FROM ccusage_model_breakdowns
    ${where}
    GROUP BY model_name
    ORDER BY cost DESC
    LIMIT ${limit}
  `);
  if (rows.length === 0) return [];
  const total = rows.reduce((s, r) => s + (Number(r.cost) || 0), 0);
  const rounded = rows.map((r) => ({
    name: String(r.name),
    cost: Number(r.cost) || 0,
    tokens: Number(r.tokens) || 0,
    pct: total > 0 ? (Number(r.cost) / total) * 100 : 0,
  }));
  // Ensure the displayed percentages sum to 100 (largest-remainder style).
  const sum = rounded.reduce((s, r) => s + Math.round(r.pct), 0);
  const drift = 100 - sum;
  if (rounded.length > 0 && drift !== 0) {
    rounded[0].pct = Math.max(0, Math.round(rounded[0].pct) + drift);
  }
  return rounded.map((r) => ({ ...r, pct: Math.round(r.pct) }));
}

/* ----------------------- Activity by weekday / hour ---------------------- */

export interface BucketedActivity {
  /** Bucket label, e.g. "Mon" or "09:00". */
  label: string;
  /** 0–6 Sun..Sat for weekdays, hour int for hourly. */
  key: number;
  tokens: number;
  cost: number;
  days: number;
}

/**
 * Token/cost volume grouped by day of week, aggregated across the window.
 */
export async function getActivityByWeekday(
  days: DateRangeDays = 30
): Promise<BucketedActivity[]> {
  const where = getDuckDBDateCondition(days, "date");
  const rows = await executeDuckDBQuery(`
    SELECT
      CAST(strftime(date, '%w') AS INTEGER) AS dow,
      SUM(total_tokens) AS tokens,
      SUM(total_cost) AS cost,
      COUNT(*) AS days
    FROM ccusage_usage_daily
    ${where}
    GROUP BY dow
    ORDER BY dow ASC
  `);
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (rows.length === 0) {
    return labels.map((label, key) => ({
      label,
      key,
      tokens: 0,
      cost: 0,
      days: 0,
    }));
  }
  return rows.map((r) => {
    const key = Number(r.dow) || 0;
    return {
      label: labels[key] ?? String(key),
      key,
      tokens: Number(r.tokens) || 0,
      cost: Number(r.cost) || 0,
      days: Number(r.days) || 0,
    };
  });
}

/**
 * Token/cost volume grouped by hour of day, from the per-model breakdown
 * timestamps.
 */
export async function getActivityByHour(
  days: DateRangeDays = 30
): Promise<BucketedActivity[]> {
  const where = getDuckDBDateCondition(days, "created_at");
  const rows = await executeDuckDBQuery(`
    SELECT
      CAST(strftime(created_at, '%H') AS INTEGER) AS hour,
      SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) AS tokens,
      SUM(cost) AS cost
    FROM ccusage_model_breakdowns
    ${where}
    GROUP BY hour
    ORDER BY hour ASC
  `);
  const allHours = Array.from({ length: 24 }, (_, h) => ({
    label: `${String(h).padStart(2, "0")}:00`,
    key: h,
    tokens: 0,
    cost: 0,
    days: 0,
  }));
  if (rows.length === 0) return allHours;
  for (const r of rows) {
    const h = Number(r.hour) || 0;
    if (h >= 0 && h < 24) {
      allHours[h].tokens = Number(r.tokens) || 0;
      allHours[h].cost = Number(r.cost) || 0;
    }
  }
  return allHours;
}

/* --------------------------- Project leaderboard ------------------------- */

export interface ProjectLeaderboardEntry {
  /** Anonymized project name (directory basename). */
  name: string;
  tokens: number;
  cost: number;
  /** Share of total tokens (0–100). */
  pct: number;
}

function anonymizeProject(path: string): string {
  if (!path) return "Unknown";
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || "Unknown";
}

/**
 * Top projects by token volume for the window — the "where the work happened".
 */
export async function getProjectLeaderboard(
  days: DateRangeDays = 30,
  limit = 7
): Promise<ProjectLeaderboardEntry[]> {
  const where = getDuckDBDateCondition(days, "ccusage_usage_sessions.last_activity");
  const rows = await executeDuckDBQuery(`
    SELECT
      session_id,
      project_path,
      SUM(total_tokens) AS tokens,
      SUM(total_cost) AS cost
    FROM ccusage_usage_sessions
    ${where}
    GROUP BY session_id, project_path
    ORDER BY tokens DESC
    LIMIT ${limit}
  `);
  if (rows.length === 0) return [];
  const total = rows.reduce((s, r) => s + (Number(r.tokens) || 0), 0);
  return rows.map((r) => ({
    name: anonymizeProject(String(r.project_path ?? "Unknown")),
    tokens: Number(r.tokens) || 0,
    cost: Number(r.cost) || 0,
    pct: total > 0 ? Math.round((Number(r.tokens) / total) * 100) : 0,
  }));
}
