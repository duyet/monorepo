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

  const result = await executeClickHouseQuery(query);

  if (!result.success) {
    console.warn("[WakaTime ClickHouse] Query failed:", result.error);
    return [];
  }

  const records = result.data.map((row) =>
    parseActivityRecord(row as unknown as ClickHouseActivityRecord)
  );

  return records;
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
