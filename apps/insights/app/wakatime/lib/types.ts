/**
 * WakaTime Hybrid Storage Types
 *
 * TypeScript interfaces for the hybrid WakaTime data storage system
 * that combines ClickHouse historical data with fresh API data.
 */

/**
 * Daily activity record stored in ClickHouse (monorepo_wakatime_activity)
 */
export interface WakaTimeDailyActivity {
  date: string;
  total_seconds: number;
  human_seconds: number;
  ai_seconds: number;
  has_ai_breakdown: boolean;
  source?: "api" | "insights" | "backfill";
}

/**
 * Activity record formatted for charts (hours instead of seconds)
 */
export interface WakaTimeActivityForChart {
  date: string;
  "Human Hours": number;
  "AI Hours": number;
}

/**
 * Activity record without AI breakdown (from insights endpoint)
 */
export interface WakaTimeActivityTotalOnly {
  date: string;
  "Total Hours": number;
}

/**
 * Union type for activity data formats
 */
export type WakaTimeActivityData =
  | WakaTimeActivityForChart
  | WakaTimeActivityTotalOnly;

/**
 * Result from hybrid fetch operation with source metadata
 */
export interface HybridFetchResult<T> {
  data: T[];
  source: {
    api_count: number;
    clickhouse_count: number;
    total_count: number;
  };
  freshness: {
    oldest_date: string;
    newest_date: string;
    api_cutoff_date: string;
  };
}

/**
 * Configuration for hybrid fetch behavior
 */
export interface HybridFetchConfig {
  /** Number of days to fetch from API (fresh data) */
  freshDataDays: number;
  /** Whether to fall back to API-only if ClickHouse fails */
  fallbackToApiOnly: boolean;
  /** Log level for debugging */
  logLevel: "none" | "info" | "debug";
}

/**
 * Default hybrid fetch configuration
 */
export const DEFAULT_HYBRID_CONFIG: HybridFetchConfig = {
  freshDataDays: 7,
  fallbackToApiOnly: true,
  logLevel: "info",
};

/**
 * ClickHouse record format (raw from query)
 */
export interface ClickHouseActivityRecord {
  date: string;
  total_seconds: string | number;
  human_seconds: string | number;
  ai_seconds: string | number;
  has_ai_breakdown: number;
  source?: string;
  sync_version?: number;
  synced_at?: string;
}
