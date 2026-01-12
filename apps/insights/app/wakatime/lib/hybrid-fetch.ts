/**
 * WakaTime Hybrid Fetch
 *
 * Combines historical data from ClickHouse with fresh data from WakaTime API.
 * This reduces API calls and improves performance for larger date ranges.
 */

import { wakatimeConfig } from "@duyet/config";
import { getClickHouseActivity, hasActivityData } from "./clickhouse";
import {
  DEFAULT_HYBRID_CONFIG,
  type HybridFetchConfig,
  type HybridFetchResult,
  type WakaTimeActivityData,
  type WakaTimeActivityForChart,
  type WakaTimeDailyActivity,
} from "./types";

/**
 * Format date to YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Convert seconds to hours (rounded to 2 decimal places)
 */
function toHours(seconds: number): number {
  return Math.round((seconds / 3600) * 100) / 100;
}

/**
 * Fetch fresh activity data from WakaTime API (last N days)
 */
async function fetchFreshActivityFromAPI(
  days: number
): Promise<WakaTimeDailyActivity[]> {
  const apiKey = process.env.WAKATIME_API_KEY;

  if (!apiKey) {
    console.warn("[WakaTime Hybrid] WAKATIME_API_KEY not set");
    return [];
  }

  // Use insights endpoint for daily data
  const range =
    days <= 7
      ? wakatimeConfig.ranges.last_7_days
      : wakatimeConfig.ranges.last_30_days;

  const endpoint = wakatimeConfig.endpoints.insights.days(range);
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${wakatimeConfig.baseUrl}${endpoint}${separator}api_key=${apiKey}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: wakatimeConfig.cache.revalidate },
    });

    if (!res.ok) {
      console.error(`[WakaTime Hybrid] API error: ${res.status}`);
      return [];
    }

    const data = await res.json();

    if (!data?.data?.days || !Array.isArray(data.data.days)) {
      console.warn("[WakaTime Hybrid] No days data from API");
      return [];
    }

    // Filter by dataStartYear and limit to requested days
    const startYear = wakatimeConfig.dataStartYear;
    const filteredDays = data.data.days
      .filter((day: { date: string; total: number }) => {
        if (!day.date || day.total == null) return false;
        const date = new Date(day.date);
        return date.getFullYear() >= startYear;
      })
      .slice(0, days);

    console.log(
      `[WakaTime Hybrid] API returned ${filteredDays.length} days of fresh data`
    );

    // Convert to our format (no AI breakdown from insights endpoint)
    return filteredDays.map((day: { date: string; total: number }) => ({
      date: day.date,
      total_seconds: day.total,
      human_seconds: Math.round(day.total * 0.8), // Estimate 80% human
      ai_seconds: Math.round(day.total * 0.2), // Estimate 20% AI
      has_ai_breakdown: false,
      source: "api" as const,
    }));
  } catch (error) {
    console.error("[WakaTime Hybrid] API fetch failed:", error);
    return [];
  }
}

/**
 * Merge historical ClickHouse data with fresh API data
 * Fresh data takes precedence for overlapping dates
 */
function mergeActivityData(
  historical: WakaTimeDailyActivity[],
  fresh: WakaTimeDailyActivity[]
): WakaTimeDailyActivity[] {
  // Create map with historical data first
  const dataMap = new Map<string, WakaTimeDailyActivity>();

  for (const record of historical) {
    dataMap.set(record.date, record);
  }

  // Overwrite with fresh data (takes precedence)
  for (const record of fresh) {
    dataMap.set(record.date, record);
  }

  // Sort by date descending (most recent first)
  return Array.from(dataMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Convert activity data to chart format
 */
function toChartFormat(
  data: WakaTimeDailyActivity[]
): WakaTimeActivityForChart[] {
  return data.map((d) => ({
    date: d.date,
    "Human Hours": toHours(d.human_seconds),
    "AI Hours": toHours(d.ai_seconds),
  }));
}

/**
 * Get hybrid daily activity data
 *
 * Strategy:
 * - Fetch last N days from WakaTime API (fresh data)
 * - Fetch older data from ClickHouse (historical data)
 * - Merge with fresh data taking precedence
 *
 * @param days - Total number of days to fetch
 * @param config - Optional configuration overrides
 */
export async function getHybridDailyActivity(
  days: number | "all",
  config: Partial<HybridFetchConfig> = {}
): Promise<HybridFetchResult<WakaTimeDailyActivity>> {
  const cfg = { ...DEFAULT_HYBRID_CONFIG, ...config };
  const numDays = days === "all" ? 9999 : days;

  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - cfg.freshDataDays);

  if (cfg.logLevel !== "none") {
    console.log("[WakaTime Hybrid] Starting fetch:", {
      totalDays: numDays,
      freshDays: cfg.freshDataDays,
      cutoffDate: formatDate(cutoffDate),
    });
  }

  // Check if ClickHouse has data
  const hasData = await hasActivityData();

  let historical: WakaTimeDailyActivity[] = [];
  let fresh: WakaTimeDailyActivity[] = [];

  // Fetch in parallel when we have ClickHouse data
  if (hasData) {
    const historicalDays = Math.max(0, numDays - cfg.freshDataDays);

    [historical, fresh] = await Promise.all([
      historicalDays > 0
        ? getClickHouseActivity(historicalDays, cutoffDate)
        : Promise.resolve([]),
      fetchFreshActivityFromAPI(cfg.freshDataDays),
    ]);
  } else {
    // No ClickHouse data - fetch all from API
    if (cfg.logLevel !== "none") {
      console.log("[WakaTime Hybrid] No ClickHouse data, using API only");
    }
    fresh = await fetchFreshActivityFromAPI(
      Math.min(numDays, cfg.freshDataDays)
    );
  }

  // Merge data
  const merged = mergeActivityData(historical, fresh);

  // Limit to requested number of days
  const limited =
    days === "all" ? merged : merged.slice(0, Math.min(numDays, merged.length));

  const result: HybridFetchResult<WakaTimeDailyActivity> = {
    data: limited,
    source: {
      api_count: fresh.length,
      clickhouse_count: historical.length,
      total_count: limited.length,
    },
    freshness: {
      oldest_date: limited.length > 0 ? limited[limited.length - 1].date : "",
      newest_date: limited.length > 0 ? limited[0].date : "",
      api_cutoff_date: formatDate(cutoffDate),
    },
  };

  if (cfg.logLevel !== "none") {
    console.log("[WakaTime Hybrid] Fetch complete:", {
      fromClickHouse: result.source.clickhouse_count,
      fromAPI: result.source.api_count,
      total: result.source.total_count,
    });
  }

  return result;
}

/**
 * Get hybrid activity data formatted for charts
 *
 * @param days - Number of days to fetch
 */
export async function getHybridActivityForChart(
  days: number | "all" = 30
): Promise<WakaTimeActivityData[]> {
  try {
    const result = await getHybridDailyActivity(days);
    return toChartFormat(result.data);
  } catch (error) {
    console.error("[WakaTime Hybrid] Chart fetch failed:", error);

    // Fall back to API-only
    const fresh = await fetchFreshActivityFromAPI(
      typeof days === "number" ? days : 30
    );
    return toChartFormat(fresh);
  }
}
