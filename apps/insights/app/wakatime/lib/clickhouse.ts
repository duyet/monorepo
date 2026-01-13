/**
 * WakaTime ClickHouse Read Operations
 *
 * Query functions for WakaTime activity data stored in ClickHouse.
 * Write operations are handled by apps/data-sync.
 * Uses the existing ClickHouse client singleton with connection pooling.
 */

import { executeClickHouseQuery } from "@/app/ai/utils/clickhouse-client";
import type { ClickHouseActivityRecord, WakaTimeDailyActivity } from "./types";

const TABLE_NAME = "monorepo_wakatime_activity";

/**
 * Format date to YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Convert raw ClickHouse record to typed activity
 */
function parseActivityRecord(
  row: ClickHouseActivityRecord
): WakaTimeDailyActivity {
  return {
    date: String(row.date),
    total_seconds: Number(row.total_seconds) || 0,
    human_seconds: Number(row.human_seconds) || 0,
    ai_seconds: Number(row.ai_seconds) || 0,
    has_ai_breakdown: Boolean(row.has_ai_breakdown),
    source: (row.source as "api" | "insights" | "backfill") || "api",
  };
}

/**
 * Get activity data from ClickHouse for a date range
 *
 * @param days - Number of days to fetch (from today backwards)
 * @param beforeDate - Only fetch data before this date (for hybrid mode)
 */
export async function getClickHouseActivity(
  days: number,
  beforeDate?: Date
): Promise<WakaTimeDailyActivity[]> {
  const cutoffDate = beforeDate || new Date();
  const startDate = new Date(cutoffDate);
  startDate.setDate(startDate.getDate() - days);

  const query = `
    SELECT
      date,
      total_seconds,
      human_seconds,
      ai_seconds,
      has_ai_breakdown,
      source
    FROM ${TABLE_NAME}
    FINAL
    WHERE date >= '${formatDate(startDate)}'
      AND date < '${formatDate(cutoffDate)}'
      AND is_deleted = 0
    ORDER BY date DESC
  `;

  console.log("[WakaTime ClickHouse] Fetching activity:", {
    days,
    startDate: formatDate(startDate),
    cutoffDate: formatDate(cutoffDate),
  });

  const result = await executeClickHouseQuery(query);

  if (!result.success) {
    console.warn("[WakaTime ClickHouse] Query failed:", result.error);
    return [];
  }

  const records = result.data.map((row) =>
    parseActivityRecord(row as unknown as ClickHouseActivityRecord)
  );

  console.log("[WakaTime ClickHouse] Retrieved:", {
    count: records.length,
    dateRange:
      records.length > 0
        ? `${records[records.length - 1].date} to ${records[0].date}`
        : "none",
  });

  return records;
}

/**
 * Get dates that already exist in ClickHouse
 *
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Set of date strings (YYYY-MM-DD)
 */
export async function getStoredDates(
  startDate: Date,
  endDate: Date
): Promise<Set<string>> {
  const query = `
    SELECT DISTINCT date
    FROM ${TABLE_NAME}
    FINAL
    WHERE date >= '${formatDate(startDate)}'
      AND date <= '${formatDate(endDate)}'
      AND is_deleted = 0
  `;

  const result = await executeClickHouseQuery(query);

  if (!result.success) {
    console.warn("[WakaTime ClickHouse] Failed to get stored dates");
    return new Set();
  }

  const dates = new Set(result.data.map((row) => String(row.date)));

  console.log("[WakaTime ClickHouse] Stored dates:", {
    range: `${formatDate(startDate)} to ${formatDate(endDate)}`,
    count: dates.size,
  });

  return dates;
}

/**
 * Check if ClickHouse has any WakaTime activity data
 */
export async function hasActivityData(): Promise<boolean> {
  const query = `SELECT count() as cnt FROM ${TABLE_NAME} FINAL WHERE is_deleted = 0`;
  const result = await executeClickHouseQuery(query);

  if (!result.success) {
    return false;
  }

  const count = Number(result.data[0]?.cnt || 0);
  return count > 0;
}

/**
 * Get the most recent date in ClickHouse
 */
export async function getMostRecentDate(): Promise<string | null> {
  const query = `
    SELECT max(date) as max_date
    FROM ${TABLE_NAME}
    FINAL
    WHERE is_deleted = 0
  `;

  const result = await executeClickHouseQuery(query);

  if (!result.success || result.data.length === 0) {
    return null;
  }

  const maxDate = result.data[0]?.max_date;
  return maxDate ? String(maxDate) : null;
}

/**
 * Get the oldest date in ClickHouse
 */
export async function getOldestDate(): Promise<string | null> {
  const query = `
    SELECT min(date) as min_date
    FROM ${TABLE_NAME}
    FINAL
    WHERE is_deleted = 0
  `;

  const result = await executeClickHouseQuery(query);

  if (!result.success || result.data.length === 0) {
    return null;
  }

  const minDate = result.data[0]?.min_date;
  return minDate ? String(minDate) : null;
}

/**
 * Get activity statistics from ClickHouse
 */
export async function getActivityStats(): Promise<{
  totalRecords: number;
  dateRange: { oldest: string | null; newest: string | null };
  totalHours: number;
}> {
  const query = `
    SELECT
      count() as total_records,
      min(date) as oldest_date,
      max(date) as newest_date,
      sum(total_seconds) / 3600 as total_hours
    FROM ${TABLE_NAME}
    FINAL
    WHERE is_deleted = 0
  `;

  const result = await executeClickHouseQuery(query);

  if (!result.success || result.data.length === 0) {
    return {
      totalRecords: 0,
      dateRange: { oldest: null, newest: null },
      totalHours: 0,
    };
  }

  const row = result.data[0];
  return {
    totalRecords: Number(row.total_records || 0),
    dateRange: {
      oldest: row.oldest_date ? String(row.oldest_date) : null,
      newest: row.newest_date ? String(row.newest_date) : null,
    },
    totalHours: Math.round(Number(row.total_hours || 0) * 10) / 10,
  };
}
