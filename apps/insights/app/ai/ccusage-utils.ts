import type {
  CCUsageActivityByModelData,
  CCUsageActivityData,
  CCUsageCostData,
  CCUsageEfficiencyData,
  CCUsageMetricsData,
  CCUsageModelData,
  CCUsageProjectData,
  DateRangeDays,
} from "./types";
import {
  executeClickHouseQuery,
  executeClickHouseQueryLegacy,
} from "./utils/clickhouse-client";

// Track if we've already done a health check this build
let healthCheckCompleted = false;
let healthCheckPassed = false;

/**
 * Quick ping test - runs SELECT 1 with 10 second timeout
 * Returns true if ClickHouse responds, false otherwise
 */
async function pingClickHouse(): Promise<{
  success: boolean;
  latencyMs: number;
  error?: string;
}> {
  console.log("[ClickHouse Ping] Sending ping...");
  const startTime = Date.now();

  try {
    const result = await executeClickHouseQuery(
      "SELECT 1 as ping, now() as server_time",
      10000, // 10 second timeout for ping
      1 // Only 1 attempt for ping
    );

    const latencyMs = Date.now() - startTime;

    if (result.success && result.data.length > 0) {
      console.log("[ClickHouse Ping] ✓ Pong received:", {
        latencyMs,
        serverTime: result.data[0]?.server_time,
      });
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

// ============================================================================
// Re-export formatCurrency for backward compatibility
// ============================================================================

/**
 * @deprecated Use useFormattedCurrency hook instead
 * Format currency with smart rounding and $ symbol
 * Examples: $1.6, $0.05, $12.5, $156
 */
export function formatCurrency(amount: number): string {
  if (amount === 0) return "$0";
  if (amount < 0.01) return "<$0.01";
  if (amount < 1) return `$${amount.toFixed(2)}`;
  if (amount < 10) return `$${amount.toFixed(1)}`;
  return `$${Math.round(amount)}`;
}

// ============================================================================
// Query Building Utilities
// ============================================================================

/**
 * Generate date filter condition for ClickHouse queries
 * Returns the last N days including today
 */
function getDateCondition(days: DateRangeDays): string {
  if (days === "all") {
    return ""; // No date filter for all time
  }
  // For "last N days", we want N days including today
  // So for 7 days: today + 6 previous days
  // Using > instead of >= to get exactly N days
  return `WHERE date > today() - INTERVAL ${days} DAY`;
}

/**
 * Generate created_at filter condition for ClickHouse queries
 * Returns the last N days including today
 */
function getCreatedAtCondition(days: DateRangeDays): string {
  if (days === "all") {
    return ""; // No date filter for all time
  }
  // For "last N days", we want N days including today
  // Using > instead of >= to get exactly N days
  return `WHERE created_at > today() - INTERVAL ${days} DAY`;
}

/**
 * Validate and sanitize days parameter
 */
export function validateDaysParameter(days: DateRangeDays): DateRangeDays {
  if (days === "all") return "all";
  if (typeof days === "number" && days > 0 && days <= 3650) return days; // Max 10 years
  return 30; // Default fallback
}

// ============================================================================
// Privacy-Safe Data Transformation Functions
// ============================================================================

/**
 * Anonymize project paths to generic names like "Project A", "Project B"
 */
function anonymizeProjects(
  projects: Record<string, unknown>[]
): CCUsageProjectData[] {
  if (!Array.isArray(projects) || projects.length === 0) return [];

  const totalTokens = projects.reduce(
    (sum, p) => sum + (Number(p.total_tokens) || 0),
    0
  );

  return projects
    .slice(0, 15) // Top 15 projects only
    .map((project, index) => ({
      projectName: `Project ${String.fromCharCode(65 + index)}`, // A, B, C, ...
      tokens: Number(project.total_tokens) || 0,
      relativeUsage:
        totalTokens > 0
          ? Math.round(
              ((Number(project.total_tokens) || 0) / totalTokens) * 100
            )
          : 0,
      lastActivity: String(project.last_activity) || "Unknown",
    }));
}

// ============================================================================
// Data Fetching Functions for Components
// ============================================================================

/**
 * Get overview metrics for the specified time period
 */
export async function getCCUsageMetrics(
  days: DateRangeDays = 30
): Promise<CCUsageMetricsData> {
  console.log("[CCUsage Metrics] Fetching metrics for days:", days);

  // Run health check on first call to quickly detect connectivity issues
  if (!healthCheckCompleted) {
    console.log(
      "[CCUsage Metrics] First query - running ClickHouse health check..."
    );
    const pingResult = await pingClickHouse();
    if (!pingResult.success) {
      console.error(
        "[CCUsage Metrics] ✗ Health check FAILED - ClickHouse may be unreachable:",
        {
          latencyMs: pingResult.latencyMs,
          error: pingResult.error,
        }
      );
      console.error(
        "[CCUsage Metrics] This usually indicates: network issues, wrong credentials, or ClickHouse server down"
      );
      // Continue anyway - the actual queries will also fail but with more details
    } else {
      console.log("[CCUsage Metrics] ✓ Health check passed");
    }
    healthCheckCompleted = true;
    healthCheckPassed = pingResult.success;
  }

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

  console.log(
    "[CCUsage Metrics] Executing query with condition:",
    dateCondition || "ALL TIME"
  );
  const results = await executeClickHouseQueryLegacy(query);
  console.log("[CCUsage Metrics] Query results:", {
    rowCount: results?.length || 0,
  });

  if (!results || results.length === 0) {
    console.warn("[CCUsage Metrics] No data returned from query");
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
  const activeDays = Number(data.active_days) || 1;
  const cacheTokens = Number(data.cache_tokens) || 0;
  const totalCost = Number(data.total_cost) || 0;

  console.log("[CCUsage Metrics] Parsed main metrics:", {
    totalTokens,
    activeDays,
    cacheTokens,
    totalCost,
  });

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

  console.log("[CCUsage Metrics] Fetching top model...");
  const modelResults = await executeClickHouseQueryLegacy(modelQuery);
  const topModel =
    modelResults.length > 0 ? String(modelResults[0].model_name) : "N/A";

  console.log("[CCUsage Metrics] Top model:", topModel);

  const metricsData = {
    totalTokens: Math.round(totalTokens),
    dailyAverage: Math.round(totalTokens / activeDays),
    activeDays,
    cacheTokens: Math.round(cacheTokens),
    totalCost,
    topModel,
  };

  console.log("[CCUsage Metrics] Final metrics:", metricsData);
  return metricsData;
}

/**
 * Get daily usage activity for the specified time period including cost data
 * Returns token values in thousands for chart display
 */
export async function getCCUsageActivity(
  days: DateRangeDays = 30
): Promise<CCUsageActivityData[]> {
  console.log("[CCUsage Activity] Fetching activity for days:", days);

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

  const results = await executeClickHouseQueryLegacy(query);
  console.log("[CCUsage Activity] Query results:", {
    rowCount: results?.length || 0,
  });

  if (!results || results.length === 0) {
    console.warn("[CCUsage Activity] No data returned");
    return [];
  }

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
  console.log("[CCUsage Activity Raw] Fetching raw activity for days:", days);

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

  const results = await executeClickHouseQueryLegacy(query);
  console.log("[CCUsage Activity Raw] Query results:", {
    rowCount: results?.length || 0,
  });

  if (!results || results.length === 0) {
    console.warn("[CCUsage Activity Raw] No data returned");
    return [];
  }

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
 * Distribute percentages to ensure they sum to exactly 100%
 * Uses the largest remainder method for fair distribution
 */
function distributePercentages(rawPercentages: number[]): number[] {
  if (rawPercentages.length === 0) return [];

  // Handle edge cases
  const totalRaw = rawPercentages.reduce((sum, p) => sum + p, 0);
  if (totalRaw === 0) return rawPercentages.map(() => 0);

  // Step 1: Calculate integer parts and remainders
  const items = rawPercentages.map((percentage, index) => ({
    index,
    integer: Math.floor(percentage),
    remainder: percentage - Math.floor(percentage),
  }));

  // Step 2: Sum the integer parts
  const sumIntegers = items.reduce((sum, item) => sum + item.integer, 0);

  // Step 3: Distribute the remaining units (to reach 100)
  const remainingUnits = 100 - sumIntegers;

  // Step 4: Sort by remainder (descending) and distribute remaining units
  const sortedByRemainder = [...items].sort(
    (a, b) => b.remainder - a.remainder
  );

  const result = new Array(rawPercentages.length).fill(0);

  // Assign integer parts
  items.forEach((item) => {
    result[item.index] = item.integer;
  });

  // Distribute remaining units to items with largest remainders
  for (let i = 0; i < remainingUnits && i < sortedByRemainder.length; i++) {
    result[sortedByRemainder[i].index] += 1;
  }

  return result;
}

/**
 * Get model usage distribution for the specified time period
 */
export async function getCCUsageModels(
  days: DateRangeDays = 30
): Promise<CCUsageModelData[]> {
  console.log("[CCUsage Models] Fetching models for days:", days);

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

  const results = await executeClickHouseQueryLegacy(query);
  console.log("[CCUsage Models] Query results:", {
    rowCount: results?.length || 0,
  });

  if (!results || results.length === 0) {
    console.warn("[CCUsage Models] No data returned");
    return [];
  }

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
 * Get anonymized project activity for the last 30 days
 */
export async function getCCUsageProjects(): Promise<CCUsageProjectData[]> {
  const query = `
    SELECT 
      session_id,
      project_path,
      SUM(total_tokens) as total_tokens,
      SUM(total_cost) as total_cost,
      MAX(last_activity) as last_activity
    FROM ccusage_usage_sessions
    WHERE last_activity >= today() - INTERVAL 30 DAY
    GROUP BY session_id, project_path
    ORDER BY total_tokens DESC
    LIMIT 15
  `;

  const results = await executeClickHouseQueryLegacy(query);

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

  const results = await executeClickHouseQueryLegacy(query);

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

  const results = await executeClickHouseQueryLegacy(query);

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
  // Remove date suffix (YYYYMMDD pattern at the end)
  // Also handles patterns like "-v1:0" or "@20240101"
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
  console.log("[CCUsage ActivityByModel] Fetching for days:", days);

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

  const results = await executeClickHouseQueryLegacy(query);
  console.log("[CCUsage ActivityByModel] Query results:", {
    rowCount: results?.length || 0,
  });

  if (!results || results.length === 0) {
    console.warn("[CCUsage ActivityByModel] No data returned");
    return [];
  }

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
  const chartData = Array.from(pivoted.entries()).map(([date, models]) => ({
    date,
    ...models,
  }));

  console.log("[CCUsage ActivityByModel] Pivoted data:", {
    dates: chartData.length,
    models: new Set(normalizedResults.map((r) => r.model_name)).size,
  });

  return chartData;
}
