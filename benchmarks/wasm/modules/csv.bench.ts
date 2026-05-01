import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { initSync, parse_csv } from "../../../packages/wasm/pkg/csv-parser/csv_parser.js"

// Initialize WASM module
const wasmPath = join(dirname(import.meta.url.replace("file://", "")), "..", "..", "..", "packages", "wasm", "pkg", "csv-parser", "csv_parser_bg.wasm")
initSync({ module: readFileSync(wasmPath) })

const sampleCsv = readFileSync(join(import.meta.dir, "..", "fixtures", "sample.csv"), "utf-8")

export const name = "csv-parse"
export const iterations = 1000
export const input = sampleCsv
export const wasmReady = true

export function tsFn(input: unknown): string[][] {
  const text = input as string
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') { field += '"'; i += 2; continue }
        else { inQuotes = false; i++; continue }
      } else { field += ch; i++; continue }
    }
    if (ch === '"') { inQuotes = true; i++; continue }
    if (ch === ",") { row.push(field); field = ""; i++; continue }
    if (ch === "\r") { i++; continue }
    if (ch === "\n") { row.push(field); field = ""; if (row.length > 0 && !(row.length === 1 && row[0] === "")) rows.push(row); row = []; i++; continue }
    field += ch; i++
  }
  row.push(field)
  if (row.length > 0 && !(row.length === 1 && row[0] === "")) rows.push(row)
  return rows
}

export function wasmFn(input: unknown): string[][] {
  return JSON.parse(parse_csv(input as string)) as string[][]
}
