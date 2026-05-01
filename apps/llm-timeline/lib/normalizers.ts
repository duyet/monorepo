/**
 * Shared field normalization functions
 * Used by all data source adapters for consistent data formatting
 *
 * Batch mode uses native Rust binary (duyet-cli normalize).
 * Individual functions fall back to WASM for per-call usage.
 */

import { callCli } from "@duyet/libs/native-cli"
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

let _initialized = false
function ensureInit() {
  if (_initialized) return
  const jsPath = import.meta.resolve("@duyet/wasm/pkg/normalizers/normalizers.js")
  const wasmUrl = new URL("normalizers_bg.wasm", jsPath)
  const wasmPath = decodeURIComponent(
    wasmUrl.protocol === "file:" ? wasmUrl.pathname : wasmUrl.href,
  )
  const wasmBuffer = readFileSync(resolve(wasmPath))
  initSync({ module: wasmBuffer })
  _initialized = true
}

// --- Batch mode (native binary, no WASM boundary cost) ---

export interface NormalizeOp {
  fn:
    | "normalize_date"
    | "normalize_params"
    | "normalize_license"
    | "map_accessibility"
    | "normalize_type"
    | "normalize_text"
    | "convert_numeric_params"
    | "format_training_compute"
  args: [string] | [number]
}

/**
 * Process N normalization operations in a single native binary call.
 * Returns results in the same order, with empty strings mapped to null.
 */
export function normalizeBatch(
  ops: NormalizeOp[]
): (string | null)[] {
  const results = callCli<string[]>("normalize", ops)
  return results.map((r) => r || null)
}

// --- Individual functions (WASM fallback for per-call usage) ---

export function normalizeDate(raw: string): string | null {
  ensureInit()
  const result = wasm_normalize_date(raw)
  return result || null
}

export function normalizeParams(raw: string): string | null {
  ensureInit()
  const result = wasm_normalize_params(raw)
  return result || null
}

export function normalizeLicense(
  raw: string,
): "open" | "closed" | "partial" {
  ensureInit()
  return wasm_normalize_license(raw) as "open" | "closed" | "partial"
}

export function mapAccessibility(
  accessibility: string,
): "open" | "closed" | "partial" {
  ensureInit()
  return wasm_map_accessibility(accessibility) as
    | "open"
    | "closed"
    | "partial"
}

export function normalizeType(raw: string): "model" | "milestone" {
  ensureInit()
  return wasm_normalize_type(raw) as "model" | "milestone"
}

export function normalizeText(raw: string): string {
  ensureInit()
  return wasm_normalize_text(raw)
}

export function convertNumericParams(
  floatValue: number | string,
): string | null {
  ensureInit()
  const input = typeof floatValue === "number" ? String(floatValue) : floatValue
  const result = wasm_convert_numeric_params(input)
  return result || null
}

export function formatTrainingCompute(flop: number): string {
  ensureInit()
  return wasm_format_training_compute(flop)
}
