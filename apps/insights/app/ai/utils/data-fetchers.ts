import type {
  CCUsageActivityByModelData,
  CCUsageActivityData,
  CCUsageCostData,
  CCUsageEfficiencyData,
  CCUsageMetricsData,
  CCUsageModelData,
  CCUsageProjectData,
  DateRangeDays,
} from "../types";
import { anonymizeProjects, distributePercentages } from "./data-processing";
import {
  buildDateCondition,
  validateDaysParameter,
} from "./queries";

async function executeServerClickHouseQuery(
  query: string,
  timeoutMs: number,
  maxRetries: number
) {
  if (!import.meta.env.SSR) {
    return { success: false, data: [], error: "ClickHouse is server-only" };
  }

  const { executeClickHouseQuery } = await import("./database");
  return executeClickHouseQuery(query, timeoutMs, maxRetries);
}

async function testServerClickHouseConnection() {
  if (!import.meta.env.SSR) {
    return {
      success: false,
      message: "ClickHouse health check is server-only",
      details: {},
    };
  }

  const { testClickHouseConnection } = await import("./database");
  return testClickHouseConnection();
}

async function executeDuckDBCacheQuery(
  query: string
): Promise<Record<string, unknown>[]> {
  if (!import.meta.env.SSR) {
    return [];
  }

  const { executeDuckDBQuery } = await import("./duckdb-cache");
  return executeDuckDBQuery(query);
}

let hasLoggedDuckDBCacheFallback = false;
let clickHouseUnavailable = false;

const CLICKHOUSE_FALLBACK_TIMEOUT_MS = 5_000;

async function executeAnalyticsQuery(
  clickHouseQuery: string,
  duckDBQuery = clickHouseQuery
): Promise<Record<string, unknown>[]> {
  let results: Record<string, unknown>[] = [];

  if (!clickHouseUnavailable) {
    try {
      const result = await executeServerClickHouseQuery(
        clickHouseQuery,
        CLICKHOUSE_FALLBACK_TIMEOUT_MS,
        1
      );
      results = result.data;
      if (!result.success) {
        clickHouseUnavailable = true;
      }
    } catch (error) {
      console.warn(
        "[CCUsage] ClickHouse query failed, trying DuckDB cache:",
        error instanceof Error ? error.message : error
      );
      clickHouseUnavailable = true;
    }
  }

  if (results.length > 0) {
    return results;
  }

  const cacheResults = await executeDuckDBCacheQuery(duckDBQuery);
  if (cacheResults.length > 0 && !hasLoggedDuckDBCacheFallback) {
    console.log("[CCUsage] Using DuckDB cache fallback");
    hasLoggedDuckDBCacheFallback = true;
  }
  return cacheResults;
}

/**
 * DuckDB date filter for a column.
 *
 * Exported for `insight-metrics.ts`, which builds its own DuckDB statements
 * from it. Expressed through {@link DIALECT} so the `current_date` spelling
 * has exactly one home.
 */
export function getDuckDBDateCondition(days: DateRangeDays, column: string): string {
  return dateFilter("duckdb", days, column);
}

/**
 * The analytics dialect axis, in one place.
 *
 * The app serves these queries from ClickHouse and falls back to a DuckDB
 * cache when ClickHouse is unavailable, so **the same logical query is emitted
 * twice**. That only works if the two spellings are provably the same query,
 * which is the property the duplication kept quietly breaking — see
 * `getCCUsageModels`, which counted rows with `COUNT()` on one side and
 * `COUNT(*)` on the other.
 *
 * Only three things actually differ between the dialects:
 *
 * 1. how "now" is spelled — `today()` vs `current_date`;
 * 2. how a timestamp is truncated to a date and rendered as a string;
 * 3. one interval filter that ClickHouse needs table-qualified, because its
 *    `MAX(last_activity) AS last_activity` alias shadows the raw column and
 *    the engine resolves an unqualified `WHERE` reference to the aggregate.
 *
 * Everything else — column list, aggregation, `GROUP BY`, `ORDER BY`, `LIMIT`
 * — must be identical, and that is enforced by `data-fetchers.test.ts`.
 */
const DIALECT = {
  clickhouse: {
    now: "today()",
    /** Truncate a timestamp to a date, rendered as a string. */
    toDate: (column: string) => `toDate(${column})`,
  },
  duckdb: {
    now: "current_date",
    toDate: (column: string) => `CAST(${column} AS DATE)::VARCHAR`,
  },
} as const;

type Dialect = keyof typeof DIALECT;

/** The date filter for one dialect, on one column. */
function dateFilter(
  dialect: Dialect,
  days: DateRangeDays,
  column: string,
): string {
  return buildDateCondition(column, days, DIALECT[dialect].now);
}

/**
 * Inclusive interval filter that survives a shadowing select alias.
 *
 * `getCCUsageProjects` selects `MAX(last_activity) AS last_activity`, so
 * ClickHouse resolves an unqualified `WHERE last_activity` to that aggregate
 * and rejects the query ("aggregate function ... found in WHERE"). Qualifying
 * the column forces it to the raw one. Returns `""` for an unbounded range,
 * matching `buildDateCondition`.
 */
function qualifiedIntervalFilter(
  dialect: Dialect,
  days: DateRangeDays,
  column: string,
): string {
  const safeDays = validateDaysParameter(days);
  if (safeDays === "all") return "";
  return `WHERE ${column} >= ${DIALECT[dialect].now} - INTERVAL ${safeDays} DAY`;
}

// Single in-flight promise prevents concurrent callers from running duplicate checks
let healthCheckPromise: Promise<boolean> | null = null;

/**
 * Quick health check with 10 second timeout to verify ClickHouse connectivity
 * Runs only once per build; concurrent callers share the same in-flight promise.
 */
export function checkClickHouseHealth(): Promise<boolean> {
  if (healthCheckPromise !== null) {
    return healthCheckPromise;
  }

  healthCheckPromise = (async () => {
    const startTime = Date.now();

    try {
      const result = await testServerClickHouseConnection();

      if (!result.success) {
        console.error("[ClickHouse Health] ✗ Connection failed:", {
          duration: `${Date.now() - startTime}ms`,
          message: result.message,
          details: result.details,
        });
      }

      return result.success;
    } catch (error) {
      console.error("[ClickHouse Health] ✗ Health check threw error:", {
        duration: `${Date.now() - startTime}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return false;
    }
  })();

  return healthCheckPromise;
}

/**
 * Quick ping test - runs SELECT 1 with 10 second timeout
 * Returns true if ClickHouse responds, false otherwise
 */
export async function pingClickHouse(): Promise<{
  success: boolean;
  latencyMs: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const result = await executeServerClickHouseQuery(
      "SELECT 1 as ping, now() as server_time",
      10000, // 10 second timeout for ping
      1 // Only 1 attempt for ping
    );

    const latencyMs = Date.now() - startTime;

    if (result.success && result.data.length > 0) {
      return { success: true, latencyMs };
    }

    console.error("[ClickHouse Ping] ✗ No response:", {
      latencyMs,
      error: result.error,
    });
    return { success: false, latencyMs, error: result.error };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    console.error("[ClickHouse Ping] ✗ Ping failed:", {
      latencyMs,
      error: errorMsg,
    });
    return { success: false, latencyMs, error: errorMsg };
  }
}

/**
 * Get overview metrics for the specified time period
 *
 * The ClickHouse and DuckDB statements differ only in how the date filter
 * spells "now", so the body is written once and rendered per dialect.
 */
export async function getCCUsageMetrics(
  days: DateRangeDays = 30
): Promise<CCUsageMetricsData> {
  const buildMetricsQuery = (dialect: Dialect) => `
    SELECT
      SUM(total_tokens) as total_tokens,
      SUM(input_tokens) as input_tokens,
      SUM(output_tokens) as output_tokens,
      SUM(cache_creation_tokens + cache_read_tokens) as cache_tokens,
      SUM(total_cost) as total_cost,
      COUNT(DISTINCT date) as active_days
    FROM ccusage_usage_daily
    ${dateFilter(dialect, days, "date")}
  `;

  const [query, duckDBQuery] = [
    buildMetricsQuery("clickhouse"),
    buildMetricsQuery("duckdb"),
  ];

  const results = await executeAnalyticsQuery(query, duckDBQuery);

  if (!results || results.length === 0) {
    return {
      totalTokens: 0,
      dailyAverage: 0,
      activeDays: 0,
      cacheTokens: 0,
      totalCost: 0,
      topModel: "N/A",
    };
  }

  const data = results[0];
  const totalTokens = Number(data.total_tokens) || 0;
  const activeDays = Number(data.active_days) || 0;
  const cacheTokens = Number(data.cache_tokens) || 0;
  const totalCost = Number(data.total_cost) || 0;

  // Get top model separately
  const buildTopModelQuery = (dialect: Dialect) => `
    SELECT model_name, SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens
    FROM ccusage_model_breakdowns
    ${dateFilter(dialect, days, "created_at")}
    GROUP BY model_name
    ORDER BY total_tokens DESC
    LIMIT 1
  `;

  // This query used to take a `trailing` whitespace argument so that the
  // ClickHouse copy kept two spaces the DuckDB copy did not, on the grounds
  // that "the emitted SQL must not change". Nothing consumes the whitespace of
  // a build-time analytics query, and carrying it as a parameter meant the two
  // dialect variants of the *same* query differed for no reason — which is
  // precisely the signal that made real drift hard to spot.
  const [modelQuery, modelDuckDBQuery] = [
    buildTopModelQuery("clickhouse"),
    buildTopModelQuery("duckdb"),
  ];

  const modelResults = await executeAnalyticsQuery(
    modelQuery,
    modelDuckDBQuery
  );
  const topModel =
    modelResults.length > 0 ? String(modelResults[0].model_name) : "N/A";

  return {
    totalTokens: Math.round(totalTokens),
    dailyAverage: activeDays > 0 ? Math.round(totalTokens / activeDays) : 0,
    activeDays,
    cacheTokens: Math.round(cacheTokens),
    totalCost,
    topModel,
  };
}

/**
 * Daily usage rollup shared by getCCUsageActivity (chart scale) and
 * getCCUsageActivityRaw (exact counts) — both hit the same query and differ
 * only in how the returned token columns are scaled.
 */
function buildDailyUsageQuery(dialect: Dialect, days: DateRangeDays) {
  return `
    SELECT
      ${dialect === "clickhouse" ? "date" : "CAST(date AS VARCHAR)"} as date,
      SUM(total_tokens) as "Total Tokens",
      SUM(input_tokens) as "Input Tokens",
      SUM(output_tokens) as "Output Tokens",
      SUM(cache_creation_tokens + cache_read_tokens) as "Cache Tokens",
      SUM(total_cost) as "Total Cost"
    FROM ccusage_usage_daily
    ${dateFilter(dialect, days, "date")}
    GROUP BY date
    ORDER BY date ASC
  `;
}

async function fetchDailyUsage(
  days: DateRangeDays
): Promise<Record<string, unknown>[]> {
  return executeAnalyticsQuery(
    buildDailyUsageQuery("clickhouse", days),
    buildDailyUsageQuery("duckdb", days)
  );
}

function mapDailyUsage(
  results: Record<string, unknown>[],
  tokenValue: (tokens: number) => number
): CCUsageActivityData[] {
  return results.map((row) => ({
    date: String(row.date) || "Unknown",
    "Total Tokens": tokenValue(Number(row["Total Tokens"]) || 0),
    "Input Tokens": tokenValue(Number(row["Input Tokens"]) || 0),
    "Output Tokens": tokenValue(Number(row["Output Tokens"]) || 0),
    "Cache Tokens": tokenValue(Number(row["Cache Tokens"]) || 0),
    "Total Cost": Number(row["Total Cost"]) || 0, // Keep cost in actual dollars
  }));
}

/**
 * Get daily usage activity for the specified time period including cost data
 * Returns token values in thousands for chart display
 */
export async function getCCUsageActivity(
  days: DateRangeDays = 30
): Promise<CCUsageActivityData[]> {
  const results = await fetchDailyUsage(days);

  if (!results || results.length === 0) return [];

  return mapDailyUsage(
    results,
    (tokens) => Math.round(tokens / 1000) // Convert to thousands for chart readability
  );
}

/**
 * Get daily usage activity with actual token values (not divided by 1000)
 * For detailed tables that need exact numbers
 */
export async function getCCUsageActivityRaw(
  days: DateRangeDays = 30
): Promise<CCUsageActivityData[]> {
  const results = await fetchDailyUsage(days);

  if (!results || results.length === 0) return [];

  return mapDailyUsage(results, (tokens) => tokens); // Keep actual token counts
}

/**
 * Get model usage distribution for the specified time period
 */
export async function getCCUsageModels(
  days: DateRangeDays = 30
): Promise<CCUsageModelData[]> {
  const buildModelsQuery = (dialect: Dialect) => `
    SELECT
      model_name,
      SUM(cost) as total_cost,
      SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens,
      COUNT(*) as usage_count
    FROM ccusage_model_breakdowns
    ${dateFilter(dialect, days, "created_at")}
    GROUP BY model_name
    ORDER BY total_tokens DESC
    LIMIT 10
  `;

  // `COUNT(*)`, not the `COUNT()` this used to emit for ClickHouse. Both count
  // rows in a `GROUP BY`, so the result is the same — but `COUNT()` with no
  // argument is ClickHouse-only syntax, and one of the two copies was the only
  // thing preventing the obvious "just use COUNT(*)" from being a
  // cross-dialect fix.
  const [query, duckDBQuery] = [buildModelsQuery("clickhouse"), buildModelsQuery("duckdb")];

  const results = await executeAnalyticsQuery(query, duckDBQuery);

  if (!results || results.length === 0) return [];

  const totalTokens = results.reduce(
    (sum, model) => sum + (Number(model.total_tokens) || 0),
    0
  );

  const totalCost = results.reduce(
    (sum, model) => sum + (Number(model.total_cost) || 0),
    0
  );

  // Calculate raw percentages first
  const modelData = results.map((model) => ({
    name: String(model.model_name) || "Unknown",
    tokens: Number(model.total_tokens) || 0,
    cost: Number(model.total_cost) || 0,
    rawPercent:
      totalTokens > 0
        ? ((Number(model.total_tokens) || 0) / totalTokens) * 100
        : 0,
    rawCostPercent:
      totalCost > 0 ? ((Number(model.total_cost) || 0) / totalCost) * 100 : 0,
    usageCount: Number(model.usage_count) || 0,
  }));

  // Apply proper percentage distribution to ensure sum equals 100%
  const distributedTokenPercentages = distributePercentages(
    modelData.map((m) => m.rawPercent)
  );
  const distributedCostPercentages = distributePercentages(
    modelData.map((m) => m.rawCostPercent)
  );

  return modelData.map((model, index) => ({
    name: model.name,
    tokens: model.tokens,
    cost: model.cost,
    percent: distributedTokenPercentages[index],
    costPercent: distributedCostPercentages[index],
    usageCount: model.usageCount,
  }));
}

/**
 * Get anonymized project activity for the specified time period
 */
export async function getCCUsageProjects(
  days: DateRangeDays = 30
): Promise<CCUsageProjectData[]> {
  const buildProjectsQuery = (dialect: Dialect) => `
    SELECT
      session_id,
      project_path,
      SUM(total_tokens) as total_tokens,
      SUM(total_cost) as total_cost,
      MAX(last_activity) as last_activity
    FROM ccusage_usage_sessions
    ${qualifiedIntervalFilter(
      dialect,
      days,
      "ccusage_usage_sessions.last_activity",
    )}
    GROUP BY session_id, project_path
    ORDER BY total_tokens DESC
    LIMIT 15
  `;

  const [query, duckDBQuery] = [
    buildProjectsQuery("clickhouse"),
    buildProjectsQuery("duckdb"),
  ];

  const results = await executeAnalyticsQuery(query, duckDBQuery);

  if (!results || results.length === 0) return [];

  return anonymizeProjects(results);
}

/**
 * Get cost efficiency trends over time
 */
export async function getCCUsageEfficiency(): Promise<CCUsageEfficiencyData[]> {
  const query = `
    SELECT 
      date,
      SUM(total_tokens) as tokens,
      SUM(total_cost) as cost,
      CASE 
        WHEN SUM(total_cost) > 0 
        THEN SUM(total_tokens) / SUM(total_cost)
        ELSE 0 
      END as tokens_per_dollar
    FROM ccusage_usage_daily 
    WHERE date >= today() - INTERVAL 30 DAY
    AND total_cost > 0
    GROUP BY date 
    ORDER BY date DESC
  `;

  const duckDBQuery = `
    SELECT
      CAST(date AS VARCHAR) as date,
      SUM(total_tokens) as tokens,
      SUM(total_cost) as cost,
      CASE
        WHEN SUM(total_cost) > 0
        THEN SUM(total_tokens) / SUM(total_cost)
        ELSE 0
      END as tokens_per_dollar
    FROM ccusage_usage_daily
    WHERE date >= current_date - INTERVAL 30 DAY
    AND total_cost > 0
    GROUP BY date
    ORDER BY date DESC
  `;

  const results = await executeAnalyticsQuery(query, duckDBQuery);

  if (!results || results.length === 0) return [];

  return results.map((row) => ({
    date: String(row.date) || "Unknown",
    "Efficiency Score": Math.round(Number(row.tokens_per_dollar) || 0), // Tokens per dollar spent
  }));
}

/**
 * Get daily cost breakdown for the specified time period
 * Note: Individual cost breakdown by token type is calculated proportionally
 * based on token usage ratios since the schema only stores total_cost
 */
export async function getCCUsageCosts(
  days: DateRangeDays = 30
): Promise<CCUsageCostData[]> {
  const buildCostsQuery = (dialect: Dialect) => `
    SELECT
      ${dialect === "clickhouse" ? "date" : "CAST(date AS VARCHAR)"} as date,
      SUM(total_cost) as total_cost,
      SUM(input_tokens) as input_tokens,
      SUM(output_tokens) as output_tokens,
      SUM(cache_creation_tokens + cache_read_tokens) as cache_tokens,
      SUM(total_tokens) as total_tokens
    FROM ccusage_usage_daily
    ${dateFilter(dialect, days, "date")}
    GROUP BY date
    ORDER BY date ASC
  `;

  // `CAST(date AS VARCHAR)` is the one place the *selected* expression differs
  // and not just the filter: the column is already a `Date` in ClickHouse but
  // a string in the DuckDB cache, and the mapper downstream expects a string
  // in both cases.
  const [query, duckDBQuery] = [buildCostsQuery("clickhouse"), buildCostsQuery("duckdb")];

  const results = await executeAnalyticsQuery(query, duckDBQuery);

  if (!results || results.length === 0) return [];

  return results.map((row) => {
    const totalCost = Number(row.total_cost) || 0;
    const inputTokens = Number(row.input_tokens) || 0;
    const outputTokens = Number(row.output_tokens) || 0;
    const cacheTokens = Number(row.cache_tokens) || 0;
    const totalTokens = Number(row.total_tokens) || 0;

    // Calculate proportional costs based on token usage ratios
    // This is an approximation since actual pricing varies by token type
    const inputCost =
      totalTokens > 0 ? (totalCost * inputTokens) / totalTokens : 0;
    const outputCost =
      totalTokens > 0 ? (totalCost * outputTokens) / totalTokens : 0;
    const cacheCost =
      totalTokens > 0 ? (totalCost * cacheTokens) / totalTokens : 0;

    return {
      date: String(row.date) || "Unknown",
      "Total Cost": totalCost,
      "Input Cost": inputCost,
      "Output Cost": outputCost,
      "Cache Cost": cacheCost,
    };
  });
}

/**
 * Pivot daily token rows into `[{ date, <model>: tokensInK }]` for Recharts.
 *
 * Colliding names are **summed**, not overwritten. `normalizeModelName` maps
 * several distinct names onto one chart series on purpose — date and version
 * suffixes are noise for a stacked area chart — and the real model set contains
 * four such pairs:
 *
 *   claude-haiku-4-5   <- claude-haiku-4-5-20251001
 *   claude-opus-4-5    <- claude-opus-4-5-20251101
 *   claude-3-5-sonnet  <- claude-3-5-sonnet-20241022
 *   glm-5              <- glm-5:cloud
 *
 * The pivot used to be `pivoted[date][model] = tokens`, i.e. last-write-wins,
 * so one of each pair's totals was silently discarded and *which* one depended
 * on the order the database returned rows in. DuckDB's parallel GROUP BY does
 * not guarantee that order, so the same data could render two different charts
 * on two consecutive builds. Summing is both the intended aggregation and
 * order-independent.
 *
 * Exported so it can be tested directly: `executeAnalyticsQuery` is
 * module-private, so a test can reach this logic but not the code around it.
 */
export function pivotActivityByModel(
  rows: Record<string, unknown>[]
): CCUsageActivityByModelData[] {
  const pivoted = new Map<string, Record<string, number>>();

  for (const row of rows) {
    const date = String(row.date);
    const model = normalizeModelName(String(row.model_name));
    const tokens = Math.round((Number(row.total_tokens) || 0) / 1000); // Convert to K

    const forDate = pivoted.get(date);
    if (forDate) {
      forDate[model] = (forDate[model] ?? 0) + tokens;
    } else {
      pivoted.set(date, { [model]: tokens });
    }
  }

  return Array.from(pivoted.entries()).map(([date, models]) => ({
    date,
    ...models,
  }));
}

/**
 * Normalize model names for better display
 * Removes date suffixes while preserving the core model identifier
 * Examples:
 *   "claude-opus-4-5-20251101" → "claude-opus-4-5"
 *   "claude-3-5-sonnet-20241022" → "claude-3-5-sonnet"
 *   "claude-3-haiku-20240307" → "claude-3-haiku"
 */
function normalizeModelName(rawName: string): string {
  const normalized = rawName
    .replace(/-\d{8}$/, "") // Remove -YYYYMMDD suffix
    .replace(/@\d{8}$/, "") // Remove @YYYYMMDD suffix
    .replace(/-v\d+:\d+$/, "") // Remove -v1:0 style suffixes
    .replace(/:.*$/, ""); // Remove everything after colon (API version markers)

  return normalized || rawName;
}

/**
 * Get daily token usage by model for the specified time period
 * Returns pivoted data suitable for stacked bar chart
 */
export async function getCCUsageActivityByModel(
  days: DateRangeDays = 30
): Promise<CCUsageActivityByModelData[]> {
  const buildByModelQuery = (dialect: Dialect) => {
    const day = DIALECT[dialect].toDate("created_at");
    return `
    SELECT
      ${day} as date,
      model_name,
      SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens
    FROM ccusage_model_breakdowns
    ${dateFilter(dialect, days, "created_at")}
    GROUP BY ${day}, model_name
    ORDER BY date ASC
  `;
  };

  // The `SELECT` and the `GROUP BY` must truncate with the *same* expression:
  // ClickHouse's `toDate(x)` and DuckDB's `CAST(x AS DATE)::VARCHAR` are
  // different functions, and grouping by one while selecting the other is how
  // a per-day series silently collapses into a single row.
  const [query, duckDBQuery] = [
    buildByModelQuery("clickhouse"),
    buildByModelQuery("duckdb"),
  ];

  const results = await executeAnalyticsQuery(query, duckDBQuery);

  if (!results || results.length === 0) return [];

  return pivotActivityByModel(results);
}
