import type {
  CCUsageActivityData,
  CCUsageCostData,
  CCUsageEfficiencyData,
  CCUsageMetricsData,
  CCUsageModelData,
  CCUsageProjectData,
  DateRangeDays,
} from "../types";
import { anonymizeProjects, distributePercentages } from "./data-processing";
import { executeClickHouseQueryLegacy } from "./database";
import { getCreatedAtCondition, getDateCondition } from "./queries";

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

  const results = await executeClickHouseQueryLegacy(query);

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
  const activeDays = Number(data.active_days) || 1;
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

  const modelResults = await executeClickHouseQueryLegacy(modelQuery);
  const topModel =
    modelResults.length > 0 ? String(modelResults[0].model_name) : "N/A";

  return {
    totalTokens: Math.round(totalTokens),
    dailyAverage: Math.round(totalTokens / activeDays),
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

  const results = await executeClickHouseQueryLegacy(query);

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

  const results = await executeClickHouseQueryLegacy(query);

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

  const results = await executeClickHouseQueryLegacy(query);

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
