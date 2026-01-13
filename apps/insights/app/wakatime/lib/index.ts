/**
 * WakaTime Hybrid Storage Library
 *
 * Exports for the hybrid WakaTime data storage system.
 * Sync/backfill operations are handled by apps/data-sync.
 */

// Types
export type {
  WakaTimeDailyActivity,
  WakaTimeActivityForChart,
  WakaTimeActivityTotalOnly,
  WakaTimeActivityData,
  HybridFetchResult,
  HybridFetchConfig,
} from "./types";

export { DEFAULT_HYBRID_CONFIG } from "./types";

// ClickHouse operations (read-only)
export {
  getClickHouseActivity,
  getStoredDates,
  hasActivityData,
  getMostRecentDate,
  getOldestDate,
  getActivityStats,
} from "./clickhouse";

// Hybrid fetch (ClickHouse + API)
export {
  getHybridDailyActivity,
  getHybridActivityForChart,
} from "./hybrid-fetch";
