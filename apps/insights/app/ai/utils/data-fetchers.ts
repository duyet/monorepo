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
  getCreatedAtCondition,
  getDateCondition,
  validateDaysParameter,
} from "./queries";

async function executeServerClickHouseQuery(
  query: string,
  timeoutMs: number,
  maxRetries: number
) {
  if (typeof window !== "undefined") {
    return { success: false, data: [], error: "ClickHouse is server-only" };
  }

  const { executeClickHouseQuery } = await import(
    /* @vite-ignore */ "./database"
  );
  return executeClickHouseQuery(query, timeoutMs, maxRetries);
}

async function testServerClickHouseConnection() {
  if (typeof window !== "undefined") {
    return {
      success: false,
      message: "ClickHouse health check is server-only",
      details: {},
    };
  }

  const { testClickHouseConnection } = await import(
    /* @vite-ignore */ "./database"
  );
  return testClickHouseConnection();
}

async function executeDuckDBCacheQuery(
  query: string
): Promise<Record<string, unknown>[]> {
  if (typeof window !== "undefined") {
    return [];
  }

  const { executeDuckDBQuery } = await import(
    /* @vite-ignore */ "./duckdb-cache"
  );
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

function getDuckDBDateCondition(days: DateRangeDays, column: string): string {
  const safeDays = validateDaysParameter(days);
  if (safeDays === "all") return "";
  return `WHERE ${column} > current_date - INTERVAL ${safeDays} DAY`;
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
 */
export async function getCCUsageMetrics(
  days: DateRangeDays = 30
): Promise<CCUsageMetricsData> {
  const dateCondition = getDateCondition(days);
  const query = `
    SELECT
      SUM(total_tokens) as total_tokens,
      SUM(input_tokens) as input_tokens,
      SUM(output_tokens) as output_tokens,
      SUM(cache_creation_tokens + cache_read_tokens) as cache_tokens,
      SUM(total_cost) as total_cost,
      COUNT(DISTINCT date) as active_days
    FROM ccusage_usage_daily
    ${dateCondition}
  `;

  const duckDBQuery = `
    SELECT
      SUM(total_tokens) as total_tokens,
      SUM(input_tokens) as input_tokens,
      SUM(output_tokens) as output_tokens,
      SUM(cache_creation_tokens + cache_read_tokens) as cache_tokens,
      SUM(total_cost) as total_cost,
      COUNT(DISTINCT date) as active_days
    FROM ccusage_usage_daily
    ${getDuckDBDateCondition(days, "date")}
  `;

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
  const modelDateCondition = getCreatedAtCondition(days);
  const modelQuery = `
    SELECT model_name, SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens
    FROM ccusage_model_breakdowns
    ${modelDateCondition}  
    GROUP BY model_name
    ORDER BY total_tokens DESC
    LIMIT 1
  `;

  const modelDuckDBQuery = `
    SELECT model_name, SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens
    FROM ccusage_model_breakdowns
    ${getDuckDBDateCondition(days, "created_at")}
    GROUP BY model_name
    ORDER BY total_tokens DESC
    LIMIT 1
  `;

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
 * Get daily usage activity for the specified time period including cost data
 * Returns token values in thousands for chart display
 */
export async function getCCUsageActivity(
  days: DateRangeDays = 30
): Promise<CCUsageActivityData[]> {
  const dateCondition = getDateCondition(days);
  const query = `
    SELECT
      date,
      SUM(total_tokens) as "Total Tokens",
      SUM(input_tokens) as "Input Tokens",
      SUM(output_tokens) as "Output Tokens",
      SUM(cache_creation_tokens + cache_read_tokens) as "Cache Tokens",
      SUM(total_cost) as "Total Cost"
    FROM ccusage_usage_daily
    ${dateCondition}
    GROUP BY date
    ORDER BY date ASC
  `;

  const duckDBQuery = `
    SELECT
      CAST(date AS VARCHAR) as date,
      SUM(total_tokens) as "Total Tokens",
      SUM(input_tokens) as "Input Tokens",
      SUM(output_tokens) as "Output Tokens",
      SUM(cache_creation_tokens + cache_read_tokens) as "Cache Tokens",
      SUM(total_cost) as "Total Cost"
    FROM ccusage_usage_daily
    ${getDuckDBDateCondition(days, "date")}
    GROUP BY date
    ORDER BY date ASC
  `;

  const results = await executeAnalyticsQuery(query, duckDBQuery);

  if (!results || results.length === 0) return [];

  return results.map((row) => ({
    date: String(row.date) || "Unknown",
    "Total Tokens": Math.round((Number(row["Total Tokens"]) || 0) / 1000), // Convert to thousands for chart readability
    "Input Tokens": Math.round((Number(row["Input Tokens"]) || 0) / 1000),
    "Output Tokens": Math.round((Number(row["Output Tokens"]) || 0) / 1000),
    "Cache Tokens": Math.round((Number(row["Cache Tokens"]) || 0) / 1000),
    "Total Cost": Number(row["Total Cost"]) || 0, // Keep cost in actual dollars
  }));
}

/**
 * Get daily usage activity with actual token values (not divided by 1000)
 * For detailed tables that need exact numbers
 */
export async function getCCUsageActivityRaw(
  days: DateRangeDays = 30
): Promise<CCUsageActivityData[]> {
  const dateCondition = getDateCondition(days);
  const query = `
    SELECT
      date,
      SUM(total_tokens) as "Total Tokens",
      SUM(input_tokens) as "Input Tokens",
      SUM(output_tokens) as "Output Tokens",
      SUM(cache_creation_tokens + cache_read_tokens) as "Cache Tokens",
      SUM(total_cost) as "Total Cost"
    FROM ccusage_usage_daily
    ${dateCondition}
    GROUP BY date
    ORDER BY date ASC
  `;

  const duckDBQuery = `
    SELECT
      CAST(date AS VARCHAR) as date,
      SUM(total_tokens) as "Total Tokens",
      SUM(input_tokens) as "Input Tokens",
      SUM(output_tokens) as "Output Tokens",
      SUM(cache_creation_tokens + cache_read_tokens) as "Cache Tokens",
      SUM(total_cost) as "Total Cost"
    FROM ccusage_usage_daily
    ${getDuckDBDateCondition(days, "date")}
    GROUP BY date
    ORDER BY date ASC
  `;

  const results = await executeAnalyticsQuery(query, duckDBQuery);

  if (!results || results.length === 0) return [];

  return results.map((row) => ({
    date: String(row.date) || "Unknown",
    "Total Tokens": Number(row["Total Tokens"]) || 0, // Keep actual token counts
    "Input Tokens": Number(row["Input Tokens"]) || 0,
    "Output Tokens": Number(row["Output Tokens"]) || 0,
    "Cache Tokens": Number(row["Cache Tokens"]) || 0,
    "Total Cost": Number(row["Total Cost"]) || 0,
  }));
}

/**
 * Get model usage distribution for the specified time period
 */
export async function getCCUsageModels(
  days: DateRangeDays = 30
): Promise<CCUsageModelData[]> {
  const dateCondition = getCreatedAtCondition(days);
  const query = `
    SELECT 
      model_name,
      SUM(cost) as total_cost,
      SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens,
      COUNT() as usage_count
    FROM ccusage_model_breakdowns
    ${dateCondition}  
    GROUP BY model_name
    ORDER BY total_tokens DESC
    LIMIT 10
  `;

  const duckDBQuery = `
    SELECT
      model_name,
      SUM(cost) as total_cost,
      SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens,
      COUNT(*) as usage_count
    FROM ccusage_model_breakdowns
    ${getDuckDBDateCondition(days, "created_at")}
    GROUP BY model_name
    ORDER BY total_tokens DESC
    LIMIT 10
  `;

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
  const safeDays = validateDaysParameter(days);
  const intervalClause =
    safeDays === "all"
      ? ""
      : `WHERE last_activity >= today() - INTERVAL ${safeDays} DAY`;
  const query = `
    SELECT
      session_id,
      project_path,
      SUM(total_tokens) as total_tokens,
      SUM(total_cost) as total_cost,
      MAX(last_activity) as last_activity
    FROM ccusage_usage_sessions
    ${intervalClause}
    GROUP BY session_id, project_path
    ORDER BY total_tokens DESC
    LIMIT 15
  `;

  const duckDBQuery = `
    SELECT
      session_id,
      project_path,
      SUM(total_tokens) as total_tokens,
      SUM(total_cost) as total_cost,
      MAX(last_activity) as last_activity
    FROM ccusage_usage_sessions
    ${getDuckDBDateCondition(days, "last_activity")}
    GROUP BY session_id, project_path
    ORDER BY total_tokens DESC
    LIMIT 15
  `;

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
  const dateCondition = getDateCondition(days);
  const query = `
    SELECT 
      date,
      SUM(total_cost) as total_cost,
      SUM(input_tokens) as input_tokens,
      SUM(output_tokens) as output_tokens,
      SUM(cache_creation_tokens + cache_read_tokens) as cache_tokens,
      SUM(total_tokens) as total_tokens
    FROM ccusage_usage_daily 
    ${dateCondition}
    GROUP BY date 
    ORDER BY date ASC
  `;

  const duckDBQuery = `
    SELECT
      CAST(date AS VARCHAR) as date,
      SUM(total_cost) as total_cost,
      SUM(input_tokens) as input_tokens,
      SUM(output_tokens) as output_tokens,
      SUM(cache_creation_tokens + cache_read_tokens) as cache_tokens,
      SUM(total_tokens) as total_tokens
    FROM ccusage_usage_daily
    ${getDuckDBDateCondition(days, "date")}
    GROUP BY date
    ORDER BY date ASC
  `;

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
  const dateCondition = getCreatedAtCondition(days);
  const query = `
    SELECT
      toDate(created_at) as date,
      model_name,
      SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens
    FROM ccusage_model_breakdowns
    ${dateCondition}
    GROUP BY toDate(created_at), model_name
    ORDER BY date ASC
  `;

  const duckDBQuery = `
    SELECT
      CAST(created_at AS DATE)::VARCHAR as date,
      model_name,
      SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens
    FROM ccusage_model_breakdowns
    ${getDuckDBDateCondition(days, "created_at")}
    GROUP BY CAST(created_at AS DATE), model_name
    ORDER BY date ASC
  `;

  const results = await executeAnalyticsQuery(query, duckDBQuery);

  if (!results || results.length === 0) return [];

  // Normalize model names and convert to thousands
  const normalizedResults = results.map((row) => ({
    date: String(row.date),
    model_name: normalizeModelName(String(row.model_name)),
    total_tokens: Math.round((Number(row.total_tokens) || 0) / 1000), // Convert to K
  }));

  // Pivot: create object with date as key, object of model tokens as values
  const pivoted = new Map<string, Record<string, number>>();

  for (const row of normalizedResults) {
    if (!pivoted.has(row.date)) {
      pivoted.set(row.date, {});
    }
    pivoted.get(row.date)![row.model_name] = row.total_tokens;
  }

  // Convert to array format for Recharts
  return Array.from(pivoted.entries()).map(([date, models]) => ({
    date,
    ...models,
  }));
}
