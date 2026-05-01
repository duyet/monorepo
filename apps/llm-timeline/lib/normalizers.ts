/**
 * Shared field normalization functions
 * Used by all data source adapters for consistent data formatting
 *
 * Heavy regex work is delegated to the Rust/WASM module (crates/normalizers).
 * Build the WASM module first: `bun run wasm:build` at repo root.
 */

import {
  initSync,
  normalize_date as wasm_normalize_date,
  normalize_params as wasm_normalize_params,
  normalize_license as wasm_normalize_license,
  map_accessibility as wasm_map_accessibility,
  normalize_type as wasm_normalize_type,
  normalize_text as wasm_normalize_text,
  convert_numeric_params as wasm_convert_numeric_params,
  format_training_compute as wasm_format_training_compute,
} from "@duyet/wasm/pkg/normalizers/normalizers.js"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

// Resolve WASM binary relative to the @duyet/wasm package location
// The JS bindings are at packages/wasm/pkg/normalizers/normalizers.js,
// and the WASM binary sits next to them.
let _initialized = false
function ensureInit() {
  if (_initialized) return
  // Use require.resolve equivalent to find the package location
  const jsPath = import.meta.resolve("@duyet/wasm/pkg/normalizers/normalizers.js")
  const wasmUrl = new URL("normalizers_bg.wasm", jsPath)
  const wasmPath = decodeURIComponent(
    wasmUrl.protocol === "file:" ? wasmUrl.pathname : wasmUrl.href,
  )
  const wasmBuffer = readFileSync(resolve(wasmPath))
  initSync({ module: wasmBuffer })
  _initialized = true
}

/**
 * Normalize a raw date string into YYYY-MM-DD format
 * Handles: YYYY-MM-DD, YYYY-MM, YYYY, Q1 2024, Jan 2024,
 *          Feb/2026, 2024-01-15T00:00:00, etc.
 */
export function normalizeDate(raw: string): string | null {
  ensureInit()
  const result = wasm_normalize_date(raw)
  return result || null
}

/**
 * Normalize parameter count strings
 * Handles: "175B", "1.8T", "~45B", "175 billion", plain numbers, etc.
 */
export function normalizeParams(raw: string): string | null {
  ensureInit()
  const result = wasm_normalize_params(raw)
  return result || null
}

/**
 * Normalize license/accessibility string to standard type
 */
export function normalizeLicense(
  raw: string,
): "open" | "closed" | "partial" {
  ensureInit()
  return wasm_normalize_license(raw) as "open" | "closed" | "partial"
}

/**
 * Map accessibility string to license type (Epoch.ai format)
 */
export function mapAccessibility(
  accessibility: string,
): "open" | "closed" | "partial" {
  ensureInit()
  return wasm_map_accessibility(accessibility) as
    | "open"
    | "closed"
    | "partial"
}

/**
 * Normalize model type string
 */
export function normalizeType(raw: string): "model" | "milestone" {
  ensureInit()
  return wasm_normalize_type(raw) as "model" | "milestone"
}

/**
 * Normalize text: collapse whitespace, trim
 */
export function normalizeText(raw: string): string {
  ensureInit()
  return wasm_normalize_text(raw)
}

/**
 * Convert parameter count from float to readable format
 * e.g., 175000000000.0 → "175B", 1000000000.0 → "1B"
 */
export function convertNumericParams(
  floatValue: number | string,
): string | null {
  ensureInit()
  const input = typeof floatValue === "number" ? String(floatValue) : floatValue
  const result = wasm_convert_numeric_params(input)
  return result || null
}

/**
 * Format a FLOP count as a readable string
 * e.g., 1.2e25 → "1.2e25 FLOP"
 */
export function formatTrainingCompute(flop: number): string {
  ensureInit()
  return wasm_format_training_compute(flop)
}
