#!/usr/bin/env bun
/**
 * fetch-epoch.ts — Fetch and parse Epoch.ai model data
 *
 * Usage:
 *   bun scripts/fetch-epoch.ts           # Fetch and return Model[]
 *   bun scripts/fetch-epoch.ts --stats   # Show column mapping and stats
 *
 * This script is meant to be imported by sync-data.ts, not run directly.
 */

import { detectEpochColumns, mapEpochRow } from '../lib/epoch-mapper'
import type { Model } from '../lib/types'

// Epoch.ai data source
const EPOCH_CSV_URL = 'https://epoch.ai/data/all_ai_models.csv'

/**
 * Re-export parseCsv from sync-data.ts for reuse
 * This is a simple RFC 4180 compliant CSV parser
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let i = 0

  while (i < text.length) {
    const row: string[] = []

    while (i < text.length) {
      if (text[i] === '"') {
        // Quoted field
        i++ // skip opening quote
        let field = ''
        while (i < text.length) {
          if (text[i] === '"' && text[i + 1] === '"') {
            field += '"'
            i += 2
          } else if (text[i] === '"') {
            i++ // skip closing quote
            break
          } else {
            field += text[i++]
          }
        }
        row.push(field)
        if (text[i] === ',') i++
        else if (text[i] === '\r') i++
      } else {
        // Unquoted field — read until comma or newline
        let field = ''
        while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
          field += text[i++]
        }
        row.push(field.trim())
        if (text[i] === ',') i++
        else if (text[i] === '\r') i++
      }

      // End of row
      if (i >= text.length || text[i] === '\n') {
        i++ // skip newline
        break
      }
    }

    if (row.length > 0 && !(row.length === 1 && row[0] === '')) {
      rows.push(row)
    }
  }

  return rows
}

/**
 * Fetch and parse Epoch.ai CSV data
 */
export async function fetchEpochModels(options: { verbose?: boolean } = {}): Promise<Model[]> {
  const { verbose = false } = options

  if (verbose) {
    console.log(`Fetching Epoch.ai CSV from ${EPOCH_CSV_URL}...`)
  }

  let csvText: string
  try {
    const res = await fetch(EPOCH_CSV_URL)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }
    csvText = await res.text()
  } catch (err) {
    throw new Error(`Failed to fetch Epoch.ai data: ${err}`)
  }

  const rows = parseCsv(csvText)
  if (rows.length < 2) {
    throw new Error(`CSV has no data rows (only ${rows.length} rows total)`)
  }

  // First row is header row
  const headers = rows[0]
  const dataRows = rows.slice(1)
  const colMap = detectEpochColumns(headers)

  if (verbose) {
    console.log(`  Header row: ${headers.slice(0, 10).join(' | ')}...`)
    console.log(`  Data rows: ${dataRows.length}`)
    console.log(`\nColumn mapping:`)
    for (const [field, idx] of Object.entries(colMap)) {
      console.log(`  ${field} → col[${idx}] = "${headers[idx]}"`)
    }
    const missing = ['name', 'org', 'date', 'params', 'license'].filter(f => !(f in colMap))
    if (missing.length > 0) {
      console.log(`  Not mapped: ${missing.join(', ')}`)
    }
  }

  // Check required columns
  const required = ['name', 'org', 'date']
  const missingRequired = required.filter((f) => !(f in colMap))
  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required columns: ${missingRequired.join(', ')}\n` +
      `Detected headers: ${headers.join(', ')}`
    )
  }

  // Parse rows
  const models: Model[] = []
  let skipped = 0

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const model = mapEpochRow(row, colMap)

    if (model) {
      models.push(model)
    } else {
      skipped++
      if (verbose && skipped <= 5) {
        console.log(`  Skip row ${i + 2}: ${row.slice(0, 3).join(' | ')}`)
      }
    }
  }

  if (verbose) {
    console.log(`\nParsed ${dataRows.length} rows → ${models.length} valid, ${skipped} skipped`)
    console.log(`Date range: ${models[0]?.date} to ${models[models.length - 1]?.date}`)
  }

  return models
}

// CLI entry point for testing
if (import.meta.main) {
  const args = process.argv.slice(2)
  const isVerbose = args.includes('--stats') || args.includes('--verbose')

  fetchEpochModels({ verbose: isVerbose })
    .then((models) => {
      console.log(`\nTotal models: ${models.length}`)
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
