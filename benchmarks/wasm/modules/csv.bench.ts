import { readFileSync } from "node:fs"
import { join } from "node:path"

const sampleCsv = readFileSync(join(import.meta.dir, "..", "fixtures", "sample.csv"), "utf-8")

export const name = "csv-parse"
export const iterations = 1000
export const input = sampleCsv
export const wasmReady = false

/**
 * TS CSV parser — RFC 4180 compliant, handles quoted fields, embedded commas,
 * embedded newlines, and escaped double-quotes.
 */
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
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        } else {
          inQuotes = false
          i++
          continue
        }
      } else {
        field += ch
        i++
        continue
      }
    }

    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }

    if (ch === ",") {
      row.push(field)
      field = ""
      i++
      continue
    }

    if (ch === "\r") {
      i++
      continue
    }

    if (ch === "\n") {
      row.push(field)
      field = ""
      if (row.length > 0 && !(row.length === 1 && row[0] === "")) {
        rows.push(row)
      }
      row = []
      i++
      continue
    }

    field += ch
    i++
  }

  // Last field/row
  row.push(field)
  if (row.length > 0 && !(row.length === 1 && row[0] === "")) {
    rows.push(row)
  }

  return rows
}

// WASM: stub — will import from @duyet/wasm/pkg/csv-parser/csv_parser.js
export function wasmFn(input: unknown): string[][] {
  return tsFn(input)
}
