#!/usr/bin/env bun
/**
 * sync-data.ts — Pull LLM model data from Google Sheets and regenerate lib/data.ts
 *
 * Usage:
 *   bun scripts/sync-data.ts             # Fetch and write lib/data.ts
 *   bun scripts/sync-data.ts --dry-run   # Preview changes, don't write
 *   bun scripts/sync-data.ts --verbose   # Show column mapping and row details
 *   bun scripts/sync-data.ts --help      # Show this help
 *
 * Env vars (optional overrides):
 *   GOOGLE_SHEET_ID   — spreadsheet ID
 *   GOOGLE_SHEET_GID  — sheet/tab GID
 */

import { resolve } from 'path'
import { writeFileSync } from 'fs'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEFAULT_SHEET_ID = '1kc262HZSMAWI6FVsh0zJwbB-ooYvzhCHaHcNUiA0_hY'
const DEFAULT_SHEET_GID = '1158069878'

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? DEFAULT_SHEET_ID
const SHEET_GID = process.env.GOOGLE_SHEET_GID ?? DEFAULT_SHEET_GID
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`

// When running via `bun run sync` from within the package directory, CWD = package root
const OUTPUT_PATH = resolve(process.cwd(), 'lib/data.ts')

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isVerbose = args.includes('--verbose')
const showHelp = args.includes('--help') || args.includes('-h')

if (showHelp) {
  console.log(`
sync-data.ts — Sync LLM model data from Google Sheets to lib/data.ts

Usage:
  bun scripts/sync-data.ts [flags]

Flags:
  --dry-run   Print the generated output without writing the file
  --verbose   Show column mapping, skipped rows, and row-level details
  --help      Show this help message

Env vars:
  GOOGLE_SHEET_ID   Override the Google Sheets spreadsheet ID
  GOOGLE_SHEET_GID  Override the sheet tab GID

Source: ${CSV_URL}
Output: ${OUTPUT_PATH}
`)
  process.exit(0)
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Model {
  name: string
  date: string // YYYY-MM-DD
  org: string
  params: string | null
  type: 'model' | 'milestone'
  license: 'open' | 'closed' | 'partial'
  desc: string
}

// ---------------------------------------------------------------------------
// CSV parser — handles quoted fields and embedded commas/newlines (RFC 4180)
// ---------------------------------------------------------------------------

function parseCsv(text: string): string[][] {
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

// ---------------------------------------------------------------------------
// Column detection
// ---------------------------------------------------------------------------

/**
 * Normalize a header cell for alias matching:
 * - Lowercase
 * - Replace newlines/tabs with space
 * - Remove characters that aren't alphanumeric or space
 * - Collapse multiple spaces
 * - Trim
 *
 * e.g. "Parameters \n(B)" → "parameters b"
 *      "Announced\n▼"     → "announced"
 *      "Public?"          → "public"
 */
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/[\n\r\t]/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const COLUMN_ALIASES: Record<string, string[]> = {
  name: ['name', 'model', 'model name', 'title'],
  date: ['date', 'release date', 'released', 'launch date', 'announced', 'announced date', 'release'],
  org: ['org', 'organization', 'company', 'maker', 'lab', 'laboratory'],
  params: ['params', 'parameters', 'size', 'model size', 'parameters b', 'params b', 'parameters b '],
  type: ['type', 'model type', 'kind', 'tags', 'tag', 'arch', 'architecture'],
  license: ['license', 'licence', 'access type', 'public', 'public ', 'availability'],
  desc: ['desc', 'description', 'notes', 'summary', 'note', 'details'],
}

function detectColumns(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {}
  const normalizedHeaders = headers.map(normalizeHeader)

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    // Exact match first
    let idx = normalizedHeaders.findIndex(h => h.length > 0 && aliases.includes(h))
    // Then prefix match for long headers like "parameters b tokens trained b"
    if (idx === -1) {
      idx = normalizedHeaders.findIndex(
        h => h.length > 2 && aliases.some(a => a.length > 2 && (h.startsWith(a) || a.startsWith(h))),
      )
    }
    if (idx !== -1) {
      mapping[field] = idx
    }
  }

  return mapping
}

/**
 * Find the row index that contains actual column headers.
 * Scans from the top and returns the first row where we can match
 * at least 2 of the required columns (name, date, org).
 */
function findHeaderRowIndex(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const colMap = detectColumns(rows[i])
    const matchedRequired = ['name', 'date', 'org'].filter(f => f in colMap)
    // Require at least 2 required columns and that they map to distinct indices
    const indices = matchedRequired.map(f => colMap[f])
    const uniqueIndices = new Set(indices)
    if (matchedRequired.length >= 2 && uniqueIndices.size === matchedRequired.length) {
      return i
    }
  }
  return -1
}

// ---------------------------------------------------------------------------
// Field normalization
// ---------------------------------------------------------------------------

const MONTH_MAP: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

function normalizeDate(raw: string): string | null {
  const s = raw.trim()
  if (!s || s.toLowerCase() === 'tba' || s.toLowerCase() === 'tbd' || s === '-') return null

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  // Already YYYY-MM (partial date, assume first of month)
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`

  // Plain year e.g. "2024"
  if (/^\d{4}$/.test(s)) return `${s}-01-01`

  // "Q1 2024" / "Q2/2024" etc.
  const quarterMatch = s.match(/Q([1-4])[\s/]+(20\d{2})/i)
  if (quarterMatch) {
    const q = parseInt(quarterMatch[1])
    const y = quarterMatch[2]
    const month = String((q - 1) * 3 + 1).padStart(2, '0')
    return `${y}-${month}-01`
  }

  // "Feb/2026" / "Jan/2025" style (Google Sheets format)
  const slashMonthMatch = s.match(/^([a-z]{3,})\/(20\d{2})$/i)
  if (slashMonthMatch) {
    const month = MONTH_MAP[slashMonthMatch[1].toLowerCase()]
    if (month) return `${slashMonthMatch[2]}-${month}-01`
  }

  // "Jan 2024" / "January 2024" / "Jan, 2024"
  const monthMatch = s.match(/^([a-z]+)[,.\s]+(20\d{2})$/i)
  if (monthMatch) {
    const month = MONTH_MAP[monthMatch[1].toLowerCase()]
    if (month) return `${monthMatch[2]}-${month}-01`
  }

  // "2024 Jan" format
  const reverseMatch = s.match(/^(20\d{2})[,.\s]+([a-z]+)$/i)
  if (reverseMatch) {
    const month = MONTH_MAP[reverseMatch[2].toLowerCase()]
    if (month) return `${reverseMatch[1]}-${month}-01`
  }

  return null
}

function normalizeParams(raw: string): string | null {
  const s = raw.trim().toLowerCase()
  if (!s || s === 'unknown' || s === 'n/a' || s === '-' || s === 'tbd' || s === 'tba') return null

  // Already in format like "175B", "1.8T", "70B", "~45B"
  if (/^[~<>≈]?\d+(\.\d+)?[bBtTmMkK]/.test(raw.trim())) return raw.trim()

  // Compound format like "230B-A10B" (MoE active params)
  if (/^\d+(\.\d+)?[bBtTmMkK]-[aA]\d+(\.\d+)?[bBtTmMkK]/.test(raw.trim())) return raw.trim()

  // "175 billion" / "1.8 trillion" / "70 million"
  const wordMatch = s.match(/^([~<>≈]?\d+(?:\.\d+)?)\s*(billion|trillion|million|thousand|b|t|m|k)/)
  if (wordMatch) {
    const num = wordMatch[1]
    const unit = wordMatch[2]
    const unitMap: Record<string, string> = {
      billion: 'B', b: 'B',
      trillion: 'T', t: 'T',
      million: 'M', m: 'M',
      thousand: 'K', k: 'K',
    }
    return `${num}${unitMap[unit]}`
  }

  // Plain number — treat as billions
  const numMatch = s.match(/^(\d+(?:\.\d+)?)$/)
  if (numMatch) {
    const n = parseFloat(numMatch[1])
    if (n > 0) return `${n}B`
  }

  return raw.trim() || null
}

function normalizeLicense(raw: string): 'open' | 'closed' | 'partial' {
  const s = raw.trim()

  // Emoji from "Public?" column: 🟢 = open/public, 🔴 = closed/private
  if (s.includes('🟢')) return 'open'
  if (s.includes('🔴')) return 'closed'
  if (s.includes('🟡') || s.includes('🟠')) return 'partial'

  const lower = s.toLowerCase()
  if (/open|apache|mit|gpl|lgpl|bsd|cc|creative|llama.?license/.test(lower)) return 'open'
  if (/partial|research|non.commercial|limited|restricted|community/.test(lower)) return 'partial'
  if (/yes|public|true/.test(lower)) return 'open'
  if (/no|private|false|closed|proprietary/.test(lower)) return 'closed'

  return 'closed'
}

function normalizeType(raw: string): 'model' | 'milestone' {
  const s = raw.trim().toLowerCase()
  if (/milestone|event|paper|architecture|announcement|breakthrough/.test(s)) return 'milestone'
  return 'model'
}

function normalizeText(raw: string): string {
  return raw.replace(/[\n\r]/g, ' ').trim().replace(/\s+/g, ' ')
}

// ---------------------------------------------------------------------------
// TypeScript file generation
// ---------------------------------------------------------------------------

function singleQuote(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function generateDataTs(models: Model[], sourceUrl: string, syncDate: string): string {
  const lines: string[] = []

  lines.push('/**')
  lines.push(' * LLM Timeline Data')
  lines.push(' *')
  lines.push(' * ============================================================================')
  lines.push(' * LLM UPDATE INSTRUCTIONS')
  lines.push(' * ============================================================================')
  lines.push(' * To add a new model, append an object to the `models` array with:')
  lines.push(' *   - name: Model name (e.g., "GPT-4o")')
  lines.push(' *   - date: Release date as YYYY-MM-DD')
  lines.push(' *   - org: Organization (e.g., "OpenAI", "Anthropic", "Google")')
  lines.push(' *   - params: Parameter count as string or null (e.g., "175B", "1.8T (MoE)")')
  lines.push(' *   - type: "model" for regular models, "milestone" for key events')
  lines.push(' *   - license: "open" | "closed" | "partial"')
  lines.push(' *   - desc: Brief description')
  lines.push(' *')
  lines.push(' * To update existing data, find the model by name and modify fields.')
  lines.push(` * Data source: ${sourceUrl}`)
  lines.push(` * Last synced: ${syncDate}`)
  lines.push(' * ============================================================================')
  lines.push(' */')
  lines.push('')
  lines.push('export interface Model {')
  lines.push('  name: string')
  lines.push('  date: string // YYYY-MM-DD')
  lines.push('  org: string')
  lines.push('  params: string | null // e.g., "175B", "1.8T (MoE)"')
  lines.push("  type: 'model' | 'milestone'")
  lines.push("  license: 'open' | 'closed' | 'partial'")
  lines.push('  desc: string')
  lines.push('}')
  lines.push('')
  lines.push('export const models: Model[] = [')

  for (const m of models) {
    lines.push('  {')
    lines.push(`    name: ${singleQuote(m.name)},`)
    lines.push(`    date: ${singleQuote(m.date)},`)
    lines.push(`    org: ${singleQuote(m.org)},`)
    lines.push(`    params: ${m.params === null ? 'null' : singleQuote(m.params)},`)
    lines.push(`    type: ${singleQuote(m.type)},`)
    lines.push(`    license: ${singleQuote(m.license)},`)
    lines.push(`    desc: ${singleQuote(m.desc)},`)
    lines.push('  },')
  }

  lines.push(']')
  lines.push('')
  lines.push('// Get unique organizations for filter')
  lines.push('export const organizations = Array.from(new Set(models.map(m => m.org))).sort()')
  lines.push('')
  lines.push('// Get unique years for grouping')
  lines.push(
    'export const years = Array.from(new Set(models.map(m => new Date(m.date).getFullYear()))).sort((a, b) => b - a)',
  )
  lines.push('')

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Fetching CSV from Google Sheets...`)
  console.log(`  URL: ${CSV_URL}`)

  let csvText: string
  try {
    const res = await fetch(CSV_URL)
    if (!res.ok) {
      console.error(`Fetch failed: HTTP ${res.status} ${res.statusText}`)
      process.exit(1)
    }
    csvText = await res.text()
  } catch (err) {
    console.error(`Fetch error: ${err}`)
    process.exit(1)
  }

  const rows = parseCsv(csvText)
  if (rows.length < 2) {
    console.error(`CSV has no data rows (only ${rows.length} rows total)`)
    process.exit(1)
  }

  // Auto-detect which row is the header row
  const headerRowIdx = findHeaderRowIndex(rows)
  if (headerRowIdx === -1) {
    console.error(`Could not find header row in first 10 rows.`)
    console.error(`First few rows:`)
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      console.error(`  Row ${i + 1}: ${rows[i].slice(0, 5).join(' | ')}`)
    }
    console.error(`Update COLUMN_ALIASES in sync-data.ts to match these headers.`)
    process.exit(1)
  }

  const headers = rows[headerRowIdx]
  const dataRows = rows.slice(headerRowIdx + 1)
  const colMap = detectColumns(headers)

  console.log(`  Header row at index ${headerRowIdx + 1}, ${dataRows.length} data rows`)

  if (isVerbose) {
    console.log(`\nColumn mapping:`)
    console.log(`  Raw headers: ${headers.map(normalizeHeader).join(' | ')}`)
    for (const [field, idx] of Object.entries(colMap)) {
      console.log(`  ${field} → col[${idx}] = "${normalizeHeader(headers[idx])}"`)
    }
    const missing = Object.keys(COLUMN_ALIASES).filter(f => !(f in colMap))
    if (missing.length > 0) {
      console.log(`  Not mapped: ${missing.join(', ')} (will use defaults)`)
    }
  }

  // Check required columns
  const required = ['name', 'date', 'org']
  const missingRequired = required.filter(f => !(f in colMap))
  if (missingRequired.length > 0) {
    console.error(`\nMissing required columns: ${missingRequired.join(', ')}`)
    console.error(`Detected headers: ${headers.map(normalizeHeader).join(' | ')}`)
    console.error(`Update COLUMN_ALIASES in sync-data.ts to match these headers.`)
    process.exit(1)
  }

  // Parse rows
  const models: Model[] = []
  let skipped = 0

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]

    const rawName = colMap.name !== undefined ? (row[colMap.name] ?? '') : ''
    const rawDate = colMap.date !== undefined ? (row[colMap.date] ?? '') : ''
    const rawOrg = colMap.org !== undefined ? (row[colMap.org] ?? '') : ''
    const rawParams = colMap.params !== undefined ? (row[colMap.params] ?? '') : ''
    const rawType = colMap.type !== undefined ? (row[colMap.type] ?? '') : ''
    const rawLicense = colMap.license !== undefined ? (row[colMap.license] ?? '') : ''
    const rawDesc = colMap.desc !== undefined ? (row[colMap.desc] ?? '') : ''

    const name = normalizeText(rawName)
    const date = normalizeDate(rawDate)
    const org = normalizeText(rawOrg)

    if (!name || !date || !org) {
      skipped++
      if (isVerbose) {
        console.log(
          `  Skip row ${headerRowIdx + i + 2}: name=${JSON.stringify(name)} date=${JSON.stringify(rawDate)} org=${JSON.stringify(org)}`,
        )
      }
      continue
    }

    models.push({
      name,
      date,
      org,
      params: normalizeParams(rawParams),
      type: normalizeType(rawType),
      license: normalizeLicense(rawLicense),
      desc: normalizeText(rawDesc),
    })
  }

  console.log(`\nParsed ${dataRows.length} rows → ${models.length} valid, ${skipped} skipped`)

  if (models.length === 0) {
    console.error(`No valid models found — aborting to prevent overwriting with empty data`)
    process.exit(1)
  }

  // Sort by date ascending
  models.sort((a, b) => a.date.localeCompare(b.date))

  const syncDate = new Date().toISOString().slice(0, 10)
  const output = generateDataTs(models, CSV_URL, syncDate)

  const orgs = Array.from(new Set(models.map(m => m.org))).sort()
  const years = Array.from(new Set(models.map(m => new Date(m.date).getFullYear()))).sort((a, b) => b - a)

  if (isDryRun) {
    console.log(`\n--- DRY RUN: Preview of lib/data.ts (first 60 lines) ---\n`)
    console.log(output.split('\n').slice(0, 60).join('\n'))
    console.log(`\n... (${output.split('\n').length} total lines, ${models.length} models)`)
    console.log(`Organizations (${orgs.length}): ${orgs.slice(0, 10).join(', ')}${orgs.length > 10 ? ', ...' : ''}`)
    console.log(`Years: ${years.join(', ')}`)
    console.log(`\nWould write to: ${OUTPUT_PATH}`)
  } else {
    writeFileSync(OUTPUT_PATH, output, 'utf-8')
    console.log(`\nWrote ${models.length} models to ${OUTPUT_PATH}`)
    console.log(`Organizations: ${orgs.length}`)
    console.log(`Years: ${years.join(', ')}`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
