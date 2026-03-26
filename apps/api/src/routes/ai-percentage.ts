/**
 * AI Percentage API Route
 * Provides AI code usage percentage data from ClickHouse
 * @module routes/ai-percentage
 */

import { Hono } from "hono";

/**
 * Cloudflare Workers bindings interface
 */
interface Env {
  CLICKHOUSE_HOST?: string;
  CLICKHOUSE_PORT?: string;
  CLICKHOUSE_USER?: string;
  CLICKHOUSE_PASSWORD?: string;
  CLICKHOUSE_DATABASE?: string;
  CLICKHOUSE_PROTOCOL?: string;
}

interface AIPercentageRow {
  ai_percentage: number;
  total_lines_added: number;
  human_lines_added: number;
  ai_lines_added: number;
}

interface AIPercentageHistoryRow extends AIPercentageRow {
  date: string;
  total_commits: number;
  human_commits: number;
  ai_commits: number;
}

interface CountRow {
  count: number;
}

const aiPercentageRouter = new Hono<{ Bindings: Env }>();

/**
 * Get ClickHouse URL from environment
 */
function getClickHouseUrl(env: Env): string | null {
  const host = env.CLICKHOUSE_HOST;
  const password = env.CLICKHOUSE_PASSWORD;
  const user = env.CLICKHOUSE_USER || "default";
  const protocol = env.CLICKHOUSE_PROTOCOL || "https";
  const port = env.CLICKHOUSE_PORT || "443";

  if (!host || !password) {
    return null;
  }

  // ClickHouse HTTP format: https://user:password@host:port
  // Query is sent via POST body or ?query= parameter
  return `${protocol}://${user}:${encodeURIComponent(password)}@${host}:${port}`;
}

/**
 * Execute ClickHouse query using native fetch
 */
async function executeClickHouseQuery(
  url: string,
  query: string,
  database = "default"
): Promise<Record<string, unknown>[]> {
  const response = await fetch(`${url}?database=${database}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/json",
    },
    body: query,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ClickHouse query failed: ${response.status} - ${errorText}`
    );
  }

  const text = await response.text();
  const lines = text.trim().split("\n").filter(Boolean);
  return lines.map((line) => JSON.parse(line));
}

/**
 * Validate and parse days parameter.
 * Returns a safe positive integer between 1 and 3650, or null if invalid.
 */
function parseDays(input: string | undefined): number | null {
  const days = Number(input || "365");
  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    return null;
  }
  return days;
}

/**
 * Get date condition SQL for filtering by days.
 * `days` must be a validated positive integer (use parseDays first).
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
  const url = getClickHouseUrl(c.env);

  if (!url) {
    return c.json({ error: "ClickHouse not configured" }, 500);
  }

  try {
    const query = `
      SELECT
        ai_percentage,
        total_lines_added,
        human_lines_added,
        ai_lines_added
      FROM monorepo_ai_code_percentage_v2_v2
      ORDER BY date DESC
      LIMIT 1
      FORMAT JSONEachRow
    `;

    const database = c.env.CLICKHOUSE_DATABASE || "default";
    const data = await executeClickHouseQuery(url, query, database);

    if (!Array.isArray(data) || data.length === 0) {
      return c.json({ error: "No data available" }, 404);
    }

    const row = data[0] as AIPercentageRow;

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
  const url = getClickHouseUrl(c.env);

  if (!url) {
    return c.json({ error: "ClickHouse not configured" }, 500);
  }

  const days = parseDays(c.req.query("days"));
  if (days === null) {
    return c.json({ error: "Invalid 'days' parameter: must be an integer between 1 and 3650" }, 400);
  }
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
    const data = await executeClickHouseQuery(url, query, database);

    if (!Array.isArray(data)) {
      return c.json({ data: [] });
    }

    return c.json({
      data: data.map((row) => {
        const r = row as AIPercentageHistoryRow;
        return {
          date: String(r.date),
          ai_percentage: Number(r.ai_percentage) || 0,
          total_lines_added: Number(r.total_lines_added) || 0,
          human_lines_added: Number(r.human_lines_added) || 0,
          ai_lines_added: Number(r.ai_lines_added) || 0,
          total_commits: Number(r.total_commits) || 0,
          human_commits: Number(r.human_commits) || 0,
          ai_commits: Number(r.ai_commits) || 0,
        };
      }),
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
  const url = getClickHouseUrl(c.env);

  if (!url) {
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
    const data = await executeClickHouseQuery(url, query, database);

    if (!Array.isArray(data) || data.length === 0) {
      return c.json({ available: false });
    }

    const count = Number((data[0] as CountRow).count) || 0;
    return c.json({ available: count > 0 });
  } catch (error) {
    console.error("Error checking AI percentage availability:", error);
    return c.json({ available: false });
  }
});

export default aiPercentageRouter;
