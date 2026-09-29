/**
 * Shared field normalization functions
 * Used by all data source adapters for consistent data formatting
 *
 * Batch dedup goes through the native Rust binary (duyet-cli dedup) in
 * `lib/deduplicator.ts`. Field normalization here runs per-field via WASM.
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

// --- Per-field normalization (WASM) ---

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
