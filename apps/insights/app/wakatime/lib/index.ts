/**
 * WakaTime Hybrid Storage Library
 *
 * Exports for the hybrid WakaTime data storage system.
 * Sync/backfill operations are handled by apps/data-sync.
 */

// ClickHouse operations (read-only)
export {
  getActivityStats,
  getClickHouseActivity,
  getMostRecentDate,
  getOldestDate,
  getStoredDates,
  hasActivityData,
} from "./clickhouse";
// Hybrid fetch (ClickHouse + API)
export {
  getHybridActivityForChart,
  getHybridDailyActivity,
} from "./hybrid-fetch";
// Types
export type {
  HybridFetchConfig,
  HybridFetchResult,
  WakaTimeActivityData,
  WakaTimeActivityForChart,
  WakaTimeActivityTotalOnly,
  WakaTimeDailyActivity,
} from "./types";
export { DEFAULT_HYBRID_CONFIG } from "./types";
