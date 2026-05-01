import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { initSync, merge_all_sources } from "../../../packages/wasm/pkg/dedup/dedup.js"

// Initialize WASM module
const wasmPath = join(dirname(import.meta.url.replace("file://", "")), "..", "..", "..", "packages", "wasm", "pkg", "dedup", "dedup_bg.wasm")
initSync({ module: readFileSync(wasmPath) })

export const name = "dedup"
export const iterations = 2000
export const wasmReady = true

// Generate realistic dedup input: array of objects with duplicates
const baseItems = Array.from({ length: 200 }, (_, i) => ({
  id: i % 50, // Only 50 unique IDs out of 200
  name: `Item ${i % 50}`,
  value: Math.floor(Math.random() * 1000),
  category: ["A", "B", "C", "D"][i % 4],
}))

// Add some string duplicates too
const strings = Array.from({ length: 500 }, (_, i) => `entry-${i % 100}`)

export const input = { items: baseItems, strings }

export function tsFn(input: unknown): unknown {
  const { items, strings } = input as { items: Array<{ id: number; name: string; value: number; category: string }>; strings: string[] }

  // Dedup objects by id (keep first occurrence)
  const seen = new Set<number>()
  const dedupedItems = items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  // Dedup strings
  const uniqueStrings = [...new Set(strings)]

  // Count per category
  const categoryCounts: Record<string, number> = {}
  for (const item of dedupedItems) {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
  }

  return {
    dedupedCount: dedupedItems.length,
    uniqueStringCount: uniqueStrings.length,
    categoryCounts,
  }
}

export function wasmFn(input: unknown): unknown {
  const { items, strings } = input as { items: Array<{ id: number; name: string; value: number; category: string }>; strings: string[] }
  const wasmInput = JSON.stringify([items])
  return JSON.parse(merge_all_sources(wasmInput))
}
