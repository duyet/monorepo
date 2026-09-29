import type { DateRangeDays } from "../types";

/**
 * Build a `WHERE <column> > <now> - INTERVAL n DAY` filter shared by every
 * dated query in this module. Returns an empty string for "all time" so the
 * caller can inline it unconditionally.
 *
 * `nowExpr` differs per backend: ClickHouse spells it `today()`, DuckDB
 * `current_date`.
 */
export function buildDateCondition(
  column: string,
  days: DateRangeDays,
  nowExpr = "today()"
): string {
  const safeDays = validateDaysParameter(days);
  if (safeDays === "all") return "";
  return `WHERE ${column} > ${nowExpr} - INTERVAL ${safeDays} DAY`;
}

/**
 * Generate date filter condition for ClickHouse queries
 * Returns the last N days including today
 */
export function getDateCondition(days: DateRangeDays): string {
  return buildDateCondition("date", days);
}

/**
 * Generate created_at filter condition for ClickHouse queries
 * Returns the last N days including today
 */
export function getCreatedAtCondition(days: DateRangeDays): string {
  return buildDateCondition("created_at", days);
}

/**
 * Validate and sanitize days parameter
 */
export function validateDaysParameter(days: DateRangeDays): DateRangeDays {
  if (days === "all") return "all";
  if (typeof days === "number" && days > 0 && days <= 3650) return days; // Max 10 years
  return 30; // Default fallback
}
