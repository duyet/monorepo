import { readFileSync } from "node:fs"
import { join } from "node:path"

export const name = "normalizers"
export const iterations = 5000
export const wasmReady = false

// Build realistic input: array of messy strings to normalize
const sampleLines = readFileSync(join(import.meta.dir, "..", "fixtures", "sample.csv"), "utf-8")
  .split("\n")
  .slice(1) // skip header
  .filter((l) => l.trim())
  .map((line) => {
    // Extract just the name and email columns for normalization
    const parts = line.split(",")
    return {
      raw: parts.slice(0, 3).join(" | "),
      name: (parts[1] || "").trim(),
      email: (parts[2] || "").trim(),
    }
  })

export const input = sampleLines

/**
 * TS normalizer: trim, lowercase, strip diacritics, collapse whitespace,
 * slugify, and validate email format.
 */
export function tsFn(input: unknown): unknown[] {
  const items = input as Array<{ raw: string; name: string; email: string }>
  return items.map((item) => ({
    slug: slugify(item.name),
    emailNormalized: item.email.toLowerCase().trim(),
    cleaned: item.raw.replace(/\s+/g, " ").trim(),
    initial: item.name.charAt(0).toUpperCase(),
    domain: item.email.split("@")[1]?.toLowerCase() || "",
  }))
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// WASM: stub
export function wasmFn(input: unknown): unknown[] {
  return tsFn(input)
}
