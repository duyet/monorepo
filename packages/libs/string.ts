/**
 * String utility functions
 */

/**
 * Escape special characters in a string for use in a regular expression
 * @example
 * ```ts
 * escapeRegExp("hello+world") // "hello\\+world"
 * new RegExp(`(${escapeRegExp(userInput)})`, "gi")
 * ```
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
