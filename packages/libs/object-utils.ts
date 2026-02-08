/**
 * Object utility functions for @duyet/libs
 *
 * Provides common object manipulation utilities used across the monorepo.
 */

/**
 * Deep partial type - makes all properties optional recursively
 *
 * @example
 * ```ts
 * type Config = { a: number; b: { c: string } }
 * type PartialConfig = DeepPartial<Config>
 * // { a?: number; b?: { c?: string } }
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep merge two objects
 *
 * Recursively merges source into target. Source values override target values.
 * Arrays are replaced (not merged) to avoid unexpected behavior.
 *
 * @param target - Base object to merge into
 * @param source - Object to merge from (overrides)
 * @returns Merged object
 *
 * @example
 * ```ts
 * const target = { a: 1, b: { c: 2 } }
 * const source = { b: { d: 3 }, e: 4 }
 * const result = deepMerge(target, source)
 * // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 */
export function deepMerge<T extends object>(
  target: T,
  source: DeepPartial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      // Recursively merge nested objects
      result[key] = deepMerge(
        targetValue as object,
        sourceValue as DeepPartial<object>
      ) as any;
    } else if (sourceValue !== undefined) {
      // Override with source value
      result[key] = sourceValue as any;
    }
  }

  return result;
}
