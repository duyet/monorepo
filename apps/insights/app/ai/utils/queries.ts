import type { DateRangeDays } from '../types'

/**
 * Generate date filter condition for ClickHouse queries
 * Returns the last N days including today
 */
export function getDateCondition(days: DateRangeDays): string {
  if (days === 'all') {
    return '' // No date filter for all time
  }
  // For "last N days", we want N days including today
  // So for 7 days: today + 6 previous days
  // Using > instead of >= to get exactly N days
  return `WHERE date > today() - INTERVAL ${days} DAY`
}

/**
 * Generate created_at filter condition for ClickHouse queries
 * Returns the last N days including today
 */
export function getCreatedAtCondition(days: DateRangeDays): string {
  if (days === 'all') {
    return '' // No date filter for all time
  }
  // For "last N days", we want N days including today
  // Using > instead of >= to get exactly N days
  return `WHERE created_at > today() - INTERVAL ${days} DAY`
}

/**
 * Validate and sanitize days parameter
 */
export function validateDaysParameter(days: DateRangeDays): DateRangeDays {
  if (days === 'all') return 'all'
  if (typeof days === 'number' && days > 0 && days <= 3650) return days // Max 10 years
  return 30 // Default fallback
}
