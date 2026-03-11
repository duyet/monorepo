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

/**
 * Convert string to URL-safe slug
 *
 * Replaces non-alphanumeric characters with hyphens,
 * converts to lowercase, and truncates to maxLength.
 *
 * @param str - Input string to slugify
 * @param maxLength - Maximum length (default: 100)
 * @returns URL-safe slug with hyphens
 *
 * @example
 * ```ts
 * slugify("Hello World!") // "hello-world"
 * slugify("My Test String", 10) // "my-test"
 * ```
 */
export function slugify(str: string, maxLength = 100): string {
  let slug = str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Truncate to maxLength, ensuring we don't cut mid-word
  if (slug.length > maxLength) {
    const truncated = slug.slice(0, maxLength);
    const lastHyphen = truncated.lastIndexOf("-");
    slug = lastHyphen > 0 ? truncated.slice(0, lastHyphen) : truncated;
  }

  return slug;
}

/**
 * Calculate reading time for text content.
 *
 * Uses the standard reading speed of 200 words per minute.
 * Handles code blocks by counting them at 1/4 the normal rate
 * since code is read more slowly than prose.
 *
 * @param wordCount - Number of words in the content
 * @param codeBlockCount - Optional number of code blocks (default: 0)
 * @returns Reading time in minutes (minimum 1)
 *
 * @example
 * ```ts
 * getReadingTime(400) // 2
 * getReadingTime(150) // 1
 * getReadingTime(800, 2) // 5 (accounts for slower code reading)
 * ```
 */
export function getReadingTime(wordCount: number, codeBlockCount = 0): number {
  const WORDS_PER_MINUTE = 200;

  // Calculate time for prose and code separately
  const proseMinutes = wordCount / WORDS_PER_MINUTE;
  const codeMinutes = codeBlockCount * 2; // Each code block adds ~2 minutes

  const totalMinutes = proseMinutes + codeMinutes;

  // Minimum 1 minute for any content
  return Math.max(1, Math.ceil(totalMinutes));
}

/**
 * Format reading time in minutes to a human-readable string.
 *
 * @param minutes - Reading time in minutes
 * @returns Formatted reading time string (e.g., "5 min read", "1 hour 15 min read")
 *
 * @example
 * ```ts
 * formatReadingTime(5) // "5 min read"
 * formatReadingTime(60) // "1 hour read"
 * formatReadingTime(75) // "1 hour 15 min read"
 * formatReadingTime(120) // "2 hours read"
 * ```
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min read`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return hours === 1 ? "1 hour read" : `${hours} hours read`;
  }

  return hours === 1
    ? `1 hour ${remainingMinutes} min read`
    : `${hours} hours ${remainingMinutes} min read`;
}
