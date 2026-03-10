/**
 * ID Generation Utilities
 *
 * Consistent ID generation patterns across the application.
 */

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
