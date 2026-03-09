import type { DateRangeDays } from "../types";

/**
 * Generate date filter condition for ClickHouse queries
 * Returns the last N days including today
 */
export function getDateCondition(days: DateRangeDays): string {
  if (days === "all") {
    return ""; // No date filter for all time
  }
  const safeDays = validateDaysParameter(days);
  if (safeDays === "all") return "";
  return `WHERE date > today() - INTERVAL ${safeDays} DAY`;
}

/**
 * Generate created_at filter condition for ClickHouse queries
 * Returns the last N days including today
 */
export function getCreatedAtCondition(days: DateRangeDays): string {
  if (days === "all") {
    return ""; // No date filter for all time
  }
  const safeDays = validateDaysParameter(days);
  if (safeDays === "all") return "";
  return `WHERE created_at > today() - INTERVAL ${safeDays} DAY`;
}

/**
 * Validate and sanitize days parameter
 */
export function validateDaysParameter(days: DateRangeDays): DateRangeDays {
  if (days === "all") return "all";
  if (typeof days === "number" && days > 0 && days <= 3650) return days; // Max 10 years
  return 30; // Default fallback
}
