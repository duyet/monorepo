/**
 * String utility functions
 */

// Lazy WASM initialization — shared module for escape_reg_exp + slugify
let wasmEscapeRegExp: ((input: string) => string) | null = null
let _wasmSlugify: ((input: string, max?: number | null) => string) | null = null

/**
 * Initialize WASM string utilities (escape_reg_exp + slugify).
 * Call once at app startup. Falls back to JS if WASM unavailable.
 */
export async function initWasmStringUtils(): Promise<void> {
  try {
    const mod = await import(
      /* @vite-ignore */
      "@duyet/wasm/pkg/utils/utils.js"
    )
    await mod.default()
    wasmEscapeRegExp = mod.escape_reg_exp
    _wasmSlugify = mod.slugify
  } catch {
    // WASM not available — JS fallback will be used
  }
}

/** @internal Returns the WASM slugify function, or null if not initialized */
export function _getWasmSlugify(): ((input: string, max?: number | null) => string) | null {
  return _wasmSlugify
}

/**
 * Escape special characters in a string for use in a regular expression
 * @example
 * ```ts
 * escapeRegExp("hello+world") // "hello\\+world"
 * new RegExp(`(${escapeRegExp(userInput)})`, "gi")
 * ```
 */
export function escapeRegExp(str: string): string {
  if (wasmEscapeRegExp) return wasmEscapeRegExp(str)
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
