import { format, formatDistance, formatDistanceToNowStrict } from "date-fns";

export function distanceToNow(dateTime: number | Date): string {
  return formatDistanceToNowStrict(dateTime, {
    addSuffix: true,
  });
}

export function distanceFormat(from: Date, to: Date): string {
  return formatDistance(from, to);
}

export function dateFormat(date: Date, formatString: string): string {
  return format(date, formatString);
}

/**
 * Format a duration in milliseconds to a human-readable string.
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "150ms", "2.5s", "1m 30s")
 *
 * @example
 * ```ts
 * formatDuration(150) // "150ms"
 * formatDuration(2500) // "2.5s"
 * formatDuration(90000) // "1m 30s"
 * ```
 */
export function formatDuration(ms?: number): string {
  if (ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

/**
 * Generate a unique ID with the given prefix.
 *
 * Format: `{prefix}-{timestamp}-{random}`
 *
 * @param prefix - The prefix for the ID (e.g., "conv", "tc", "msg")
 * @returns A unique ID string
 *
 * @example
 * ```ts
 * generateId("conv") // "conv-1647123456789-a1b2c3d4"
 * generateId("tc") // "tc-1647123456789-x5y6z7w8"
 * ```
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
