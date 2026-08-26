/**
 * AI Percentage API Route
 * Provides AI code usage percentage data from ClickHouse
 * @module routes/ai-percentage
 */

import { Hono } from "hono";
import type { Env } from "../env.js";

const aiPercentageRouter = new Hono<{ Bindings: Env }>();
const FETCH_TIMEOUT_MS = 10_000;
const MAX_HISTORY_DAYS = 730;
const MAX_CLICKHOUSE_RESPONSE_BYTES = 1_048_576;

export interface ClickHouseRequestConfig {
  headers: Record<string, string>;
  url: string;
}

/**
 * Build a ClickHouse HTTP target without embedding credentials in the URL.
 */
export function getClickHouseConfig(env: Env): ClickHouseRequestConfig | null {
  const host = env.CLICKHOUSE_HOST;
  const password = env.CLICKHOUSE_PASSWORD;
  const user = env.CLICKHOUSE_USER || "default";
  const protocol = env.CLICKHOUSE_PROTOCOL || "https";
  const port = env.CLICKHOUSE_PORT || "443";

  if (!host || !password) {
    return null;
  }

  return {
    headers: {
      "X-ClickHouse-Key": password,
      "X-ClickHouse-User": user,
    },
    url: `${protocol}://${host}:${port}`,
  };
}

/**
 * Request builder used by executeClickHouseQuery and tests.
 * The returned URL must never include userinfo.
 */
export function buildClickHouseRequest(
  env: Env,
  query: string,
  database = "default"
): { headers: Record<string, string>; url: string; body: string } | null {
  const config = getClickHouseConfig(env);
  if (!config) {
    return null;
  }

  return {
    body: query,
    headers: {
      ...config.headers,
      Accept: "application/json",
      "Content-Type": "text/plain",
    },
    url: `${config.url}?database=${database}`,
  };
}

/**
 * Execute ClickHouse query using native fetch and header-based auth.
 */
export async function executeClickHouseQuery(
  env: Env,
  query: string,
  database = "default"
): Promise<any[]> {
  const request = buildClickHouseRequest(env, query, database);
  if (!request) {
    throw new Error("ClickHouse not configured");
  }

  const response = await fetch(request.url, {
    body: request.body,
    headers: request.headers,
    method: "POST",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ClickHouse query failed: ${response.status} - ${errorText}`
    );
  }

  const text = await response.text();
  if (text.length > MAX_CLICKHOUSE_RESPONSE_BYTES) {
    throw new Error(
      `[REDACTED] response exceeded ${MAX_CLICKHOUSE_RESPONSE_BYTES} bytes`
    );
  }

  const lines = text.trim().split("\n").filter(Boolean);
  return lines.map((line) => JSON.parse(line));
}

export function clampHistoryDays(rawDays: number): number {
  if (!Number.isFinite(rawDays) || rawDays <= 0) {
    return 365;
  }
  return Math.min(Math.floor(rawDays), MAX_HISTORY_DAYS);
}

/**
 * Get date condition SQL for filtering by days
 */
function getDateCondition(days: number): string {
  return `WHERE date >= now() - INTERVAL ${days} DAY`;
}

/**
 * GET /api/ai/percentage/current
 *
 * Returns the most recent AI code percentage
 *
 * Example response:
 * {
 *   "ai_percentage": 26.5,
 *   "total_lines_added": 125000,
 *   "human_lines_added": 92000,
 *   "ai_lines_added": 33000
 * }
 */
aiPercentageRouter.get("/current", async (c) => {
  if (!getClickHouseConfig(c.env)) {
    return c.json({ error: "ClickHouse not configured" }, 500);
  }

  try {
    const query = `
      SELECT
        ai_percentage,
        total_lines_added,
        human_lines_added,
        ai_lines_added
      FROM monorepo_ai_code_percentage_v2
      ORDER BY date DESC
      LIMIT 1
      FORMAT JSONEachRow
    `;

    const database = c.env.CLICKHOUSE_DATABASE || "default";
    const data = await executeClickHouseQuery(c.env, query, database);

    if (!Array.isArray(data) || data.length === 0) {
      return c.json({ error: "No data available" }, 404);
    }

    const row = data[0] as any;

    return c.json({
      ai_percentage: Number(row.ai_percentage) || 0,
      total_lines_added: Number(row.total_lines_added) || 0,
      human_lines_added: Number(row.human_lines_added) || 0,
      ai_lines_added: Number(row.ai_lines_added) || 0,
    });
  } catch (error) {
    console.error("Error fetching current AI percentage:", error);
    return c.json({ error: "Failed to fetch data" }, 500);
  }
});

/**
 * GET /api/ai/percentage/history?days=365
 *
 * Returns historical AI code percentage data
 *
 * Query params:
 * - days: Number of days to look back (default: 365)
 *
 * Example response:
 * {
 *   "data": [
 *     {
 *       "date": "2025-01-01",
 *       "ai_percentage": 25.5,
 *       "total_lines_added": 5000,
 *       "human_lines_added": 3725,
 *       "ai_lines_added": 1275,
 *       "total_commits": 45,
 *       "human_commits": 35,
 *       "ai_commits": 10
 *     },
 *     ...
 *   ]
 * }
 */
aiPercentageRouter.get("/history", async (c) => {
  if (!getClickHouseConfig(c.env)) {
    return c.json({ error: "ClickHouse not configured" }, 500);
  }

  const days = clampHistoryDays(Number(c.req.query("days") || "365"));
  const dateCondition = getDateCondition(days);

  try {
    const query = `
      SELECT
        date,
        ai_percentage,
        total_lines_added,
        human_lines_added,
        ai_lines_added,
        total_commits,
        human_commits,
        ai_commits
      FROM monorepo_ai_code_percentage_v2
      ${dateCondition}
      ORDER BY date ASC
      FORMAT JSONEachRow
    `;

    const database = c.env.CLICKHOUSE_DATABASE || "default";
    const data = await executeClickHouseQuery(c.env, query, database);

    if (!Array.isArray(data)) {
      return c.json({ data: [] });
    }

    return c.json({
      data: data.map((row: any) => ({
        date: String(row.date),
        ai_percentage: Number(row.ai_percentage) || 0,
        total_lines_added: Number(row.total_lines_added) || 0,
        human_lines_added: Number(row.human_lines_added) || 0,
        ai_lines_added: Number(row.ai_lines_added) || 0,
        total_commits: Number(row.total_commits) || 0,
        human_commits: Number(row.human_commits) || 0,
        ai_commits: Number(row.ai_commits) || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching AI percentage history:", error);
    return c.json({ error: "Failed to fetch data" }, 500);
  }
});

/**
 * GET /api/ai/percentage/available
 *
 * Checks if AI percentage data is available
 *
 * Example response:
 * {
 *   "available": true
 * }
 */
aiPercentageRouter.get("/available", async (c) => {
  if (!getClickHouseConfig(c.env)) {
    return c.json({ available: false });
  }

  try {
    const query = `
      SELECT count() as count
      FROM monorepo_ai_code_percentage_v2
      LIMIT 1
      FORMAT JSONEachRow
    `;

    const database = c.env.CLICKHOUSE_DATABASE || "default";
    const data = await executeClickHouseQuery(c.env, query, database);

    if (!Array.isArray(data) || data.length === 0) {
      return c.json({ available: false });
    }

    const count = Number((data[0] as any).count) || 0;
    return c.json({ available: count > 0 });
  } catch (error) {
    console.error("Error checking AI percentage availability:", error);
    return c.json({ available: false });
  }
});

export default aiPercentageRouter;
