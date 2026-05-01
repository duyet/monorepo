import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import {
  initSync,
  normalize_date,
  normalize_params,
  normalize_license,
  normalize_type,
  normalize_text,
  convert_numeric_params,
} from "../../../packages/wasm/pkg/normalizers/normalizers.js"

// Initialize WASM module
const wasmPath = join(dirname(import.meta.url.replace("file://", "")), "..", "..", "..", "packages", "wasm", "pkg", "normalizers", "normalizers_bg.wasm")
initSync({ module: readFileSync(wasmPath) })

export const name = "normalizers"
export const iterations = 5000
export const wasmReady = true

// Realistic input: messy date strings, parameter counts, licenses, types, and raw text
const dateInputs = [
  "2024-01-15",
  "2024-01-15T00:00:00",
  "2024-01",
  "2024",
  "Q1 2024",
  "Q2 2024",
  "Q3 2024",
  "Q4 2024",
  "Jan 2024",
  "February 2024",
  "Mar, 2024",
  "2024 Apr",
  "Feb/2026",
  "TBA",
  "TBD",
  "-",
  "",
  "January 2025",
  "  2023-06-15  ",
  "Q1/2025",
]

const paramInputs = [
  "175B",
  "1.8T",
  "~45B",
  "175 billion",
  "1.8 trillion",
  "70 million",
  "175",
  "unknown",
  "n/a",
  "-",
  "",
  "230B-A10B",
  "<10B",
  "≈500M",
]

const licenseInputs = [
  "Apache 2.0",
  "MIT",
  "GPL-3.0",
  "Proprietary",
  "Research only",
  "Non-commercial",
  "Yes",
  "No",
  "",
  "Llama License",
  "BSD-3",
  "Creative Commons",
  "Closed source",
  "Partial",
  "\u{1F7E2} Open",
  "\u{1F534} Closed",
  "\u{1F7E1} Partial",
]

const typeInputs = [
  "milestone",
  "event",
  "paper",
  "architecture",
  "announcement",
  "model",
  "llm",
  "transformer",
  "breakthrough",
  "vision",
]

const textInputs = [
  "  hello\nworld  ",
  "a   b    c",
  "  multiple   \n  lines  \r\n  here  ",
  "single",
  "",
  "  spaces   everywhere  ",
  "line1\nline2\nline3",
  "\t\ttabbed\tcontent\t",
]

export const input = {
  dates: dateInputs,
  params: paramInputs,
  licenses: licenseInputs,
  types: typeInputs,
  texts: textInputs,
}

// TS implementations matching the Rust/WASM normalizers
function tsNormalizeDate(raw: string): string {
  let s = raw.trim()
  if (!s || /^(tba|tbd)$/i.test(s) || s === "-") return ""

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const isoMatch = s.match(/^(\d{4}-\d{2}-\d{2})T/)
  if (isoMatch) return isoMatch[1]
  if (/^\d{4}-\d{2}$/.test(s)) return s + "-01"
  if (/^\d{4}$/.test(s)) return s + "-01-01"

  const qMatch = s.match(/Q([1-4])[\s/]+(20\d{2})/i)
  if (qMatch) {
    const q = parseInt(qMatch[1])
    const y = qMatch[2]
    return `${y}-${String((q - 1) * 3 + 1).padStart(2, "0")}-01`
  }

  const months: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12",
    jan: "01", feb: "02", mar: "03", apr: "04",
    jun: "06", jul: "07", aug: "08", sep: "09",
    oct: "10", nov: "11", dec: "12",
  }

  const slashMatch = s.match(/^([a-z]{3,})\/(20\d{2})$/i)
  if (slashMatch) {
    const m = months[slashMatch[1].toLowerCase()]
    if (m) return `${slashMatch[2]}-${m}-01`
  }

  const monthYearMatch = s.match(/^([a-z]+)[,.\s]+(20\d{2})$/i)
  if (monthYearMatch) {
    const m = months[monthYearMatch[1].toLowerCase()]
    if (m) return `${monthYearMatch[2]}-${m}-01`
  }

  const yearMonthMatch = s.match(/^(20\d{2})[,.\s]+([a-z]+)$/i)
  if (yearMonthMatch) {
    const m = months[yearMonthMatch[2].toLowerCase()]
    if (m) return `${yearMonthMatch[1]}-${m}-01`
  }

  return ""
}

function tsNormalizeParams(raw: string): string {
  const s = raw.trim()
  const lower = s.toLowerCase()
  if (!lower || lower === "unknown" || lower === "n/a" || lower === "-" || lower === "tbd" || lower === "tba") return ""

  if (/^[~<>≈]?\d+(\.\d+)?[bBtTmMkK]/.test(s)) return s
  if (/^\d+(\.\d+)?[bBtTmMkK]-[aA]\d+(\.\d+)?[bBtTmMkK]/.test(s)) return s

  const wordMatch = lower.match(/^([~<>≈]?\d+(?:\.\d+)?)\s*(billion|trillion|million|thousand|b|t|m|k)/)
  if (wordMatch) {
    const num = wordMatch[1]
    const unit = wordMatch[2]
    const suffix = /^b(illion)?$/.test(unit) ? "B"
      : /^t(rillion)?$/.test(unit) ? "T"
      : /^m(illion)?$/.test(unit) ? "M"
      : "K"
    return `${num}${suffix}`
  }

  const plainMatch = lower.match(/^(\d+(?:\.\d+)?)$/)
  if (plainMatch) {
    const n = parseFloat(plainMatch[1])
    if (n > 0) return `${n}B`
  }

  return s
}

function tsNormalizeLicense(raw: string): string {
  const s = raw.trim()
  if (s.includes("\u{1F7E2}")) return "open"
  if (s.includes("\u{1F534}")) return "closed"
  if (s.includes("\u{1F7E1}") || s.includes("\u{1F7E0}")) return "partial"
  const lower = s.toLowerCase()
  if (/open|apache|mit|gpl|lgpl|bsd|cc|creative|llama.?license/i.test(lower)) return "open"
  if (/partial|research|non.commercial|limited|restricted|community/i.test(lower)) return "partial"
  if (/yes|public|true/i.test(lower)) return "open"
  if (/no|private|false|closed|proprietary/i.test(lower)) return "closed"
  return "closed"
}

function tsNormalizeType(raw: string): string {
  const s = raw.trim().toLowerCase()
  return /milestone|event|paper|architecture|announcement|breakthrough/i.test(s) ? "milestone" : "model"
}

function tsNormalizeText(raw: string): string {
  return raw.replace(/[\n\r]/g, " ").trim().replace(/\s+/g, " ")
}

function tsConvertNumericParams(floatValue: string): string {
  if (!floatValue || floatValue === "0") return ""
  const num = parseFloat(floatValue)
  if (isNaN(num) || num === 0) return ""

  if (num >= 1e12) {
    const t = num / 1e12
    return t === Math.floor(t) ? `${t}T` : `${t.toFixed(1)}T`
  }
  if (num >= 1e9) {
    const b = num / 1e9
    return b === Math.floor(b) ? `${b}B` : `${b.toFixed(1)}B`
  }
  if (num >= 1e6) {
    const m = num / 1e6
    return m === Math.floor(m) ? `${m}M` : `${m.toFixed(1)}M`
  }
  if (num >= 1e3) {
    const k = num / 1e3
    return k === Math.floor(k) ? `${k}K` : `${k.toFixed(1)}K`
  }
  return `${Math.floor(num)}`
}

export function tsFn(input: unknown): unknown[] {
  const { dates, params, licenses, types, texts } = input as typeof import(".")
  const results: unknown[] = []

  for (const d of dates) results.push({ fn: "normalize_date", in: d, out: tsNormalizeDate(d) })
  for (const p of params) results.push({ fn: "normalize_params", in: p, out: tsNormalizeParams(p) })
  for (const l of licenses) results.push({ fn: "normalize_license", in: l, out: tsNormalizeLicense(l) })
  for (const t of types) results.push({ fn: "normalize_type", in: t, out: tsNormalizeType(t) })
  for (const t of texts) results.push({ fn: "normalize_text", in: t, out: tsNormalizeText(t) })

  const numericInputs = ["175000000000", "1000000000", "1500000000", "0", "", "1800000000000", "700000000", "5000"]
  for (const n of numericInputs) results.push({ fn: "convert_numeric_params", in: n, out: tsConvertNumericParams(n) })

  return results
}

export function wasmFn(input: unknown): unknown[] {
  const { dates, params, licenses, types, texts } = input as {
    dates: string[]
    params: string[]
    licenses: string[]
    types: string[]
    texts: string[]
  }
  const results: unknown[] = []

  for (const d of dates) results.push({ fn: "normalize_date", in: d, out: normalize_date(d) })
  for (const p of params) results.push({ fn: "normalize_params", in: p, out: normalize_params(p) })
  for (const l of licenses) results.push({ fn: "normalize_license", in: l, out: normalize_license(l) })
  for (const t of types) results.push({ fn: "normalize_type", in: t, out: normalize_type(t) })
  for (const t of texts) results.push({ fn: "normalize_text", in: t, out: normalize_text(t) })

  const numericInputs = ["175000000000", "1000000000", "1500000000", "0", "", "1800000000000", "700000000", "5000"]
  for (const n of numericInputs) results.push({ fn: "convert_numeric_params", in: n, out: convert_numeric_params(n) })

  return results
}
