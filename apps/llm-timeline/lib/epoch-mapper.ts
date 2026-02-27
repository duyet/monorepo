/**
 * Epoch.ai CSV column detection and field mapping
 * Handles the all_ai_models.csv format from https://epoch.ai/data
 */

import type { Model } from './types'

/**
 * Epoch.ai column name aliases for mapping
 * Based on the all_ai_models.csv format
 */
const EPOCH_COLUMN_ALIASES: Record<string, string[]> = {
  // Model identification
  name: ['model name', 'model', 'name', 'system'],
  org: ['organization', 'organization(s)', 'org', 'lab', 'institution', 'company'],
  date: ['publication date', 'release date', 'date', 'announced', 'published'],

  // Model specifications
  params: ['parameters', 'parameters (count)', 'params', 'model size', '# parameters'],

  // Licensing
  license: ['model accessibility', 'accessibility', 'license', 'availability', 'open source?'],

  // Description
  desc: ['notes', 'description', 'summary', 'details', 'comments'],

  // Additional Epoch metadata
  domain: ['domain', 'domain(s)', 'application domain'],
  task: ['task', 'task(s)', 'task type'],
  approach: ['approach', 'method', 'architecture type'],
  trainingCompute: ['training compute', 'compute', 'flops', 'training flops'],
  trainingHardware: ['training hardware', 'hardware', 'hardware used'],
  trainingDataset: ['training dataset', 'dataset', 'training data'],
  modelAccessibility: ['model accessibility', 'accessibility', 'public availability'],
  link: ['link', 'url', 'paper', 'publication'],
  authors: ['authors', 'author(s)', 'researchers'],
}

/**
 * Normalize a header cell for alias matching
 */
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/[\n\r\t]/g, ' ')
    .replace(/[^a-z0-9 ()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Detect Epoch.ai CSV columns and map to field indices
 */
export function detectEpochColumns(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {}
  const normalizedHeaders = headers.map(normalizeHeader)

  for (const [field, aliases] of Object.entries(EPOCH_COLUMN_ALIASES)) {
    // Exact match first
    let idx = normalizedHeaders.findIndex((h) => h && aliases.includes(h))
    // Then prefix match for longer headers
    if (idx === -1) {
      idx = normalizedHeaders.findIndex((h) =>
        h && aliases.some((a) => a.length > 3 && (h.startsWith(a) || a.startsWith(h)))
      )
    }
    if (idx !== -1) {
      mapping[field] = idx
    }
  }

  return mapping
}

/**
 * Convert parameter count from float to readable format
 * e.g., 175000000000.0 → "175B", 1000000000.0 → "1B"
 */
export function convertEpochParams(floatValue: number | string): string | null {
  if (!floatValue || floatValue === '' || floatValue === '0') return null

  const num = typeof floatValue === 'string' ? parseFloat(floatValue) : floatValue

  if (isNaN(num) || num === 0) return null

  // Trillion (T)
  if (num >= 1e12) {
    const t = num / 1e12
    return t === Math.floor(t) ? `${t}T` : `${t.toFixed(1)}T`
  }

  // Billion (B)
  if (num >= 1e9) {
    const b = num / 1e9
    return b === Math.floor(b) ? `${b}B` : `${b.toFixed(1)}B`
  }

  // Million (M)
  if (num >= 1e6) {
    const m = num / 1e6
    return m === Math.floor(m) ? `${m}M` : `${m.toFixed(1)}M`
  }

  // Thousand (K)
  if (num >= 1e3) {
    const k = num / 1e3
    return k === Math.floor(k) ? `${k}K` : `${k.toFixed(1)}K`
  }

  // Less than 1000 - return as integer
  return `${Math.floor(num)}`
}

/**
 * Map Epoch.ai accessibility string to our license type
 */
export function mapEpochAccessibility(accessibility: string): 'open' | 'closed' | 'partial' {
  const s = accessibility.toLowerCase().trim()

  if (s.includes('open') || s.includes('public') || s === 'yes' || s === 'true') {
    return 'open'
  }

  if (s.includes('closed') || s.includes('private') || s === 'no' || s === 'false') {
    return 'closed'
  }

  if (s.includes('partial') || s.includes('research') || s.includes('limited')) {
    return 'partial'
  }

  // Default to closed for unknown
  return 'closed'
}

/**
 * Normalize Epoch.ai date string to YYYY-MM-DD format
 */
export function normalizeEpochDate(rawDate: string): string | null {
  const s = rawDate.trim()

  if (!s || s.toLowerCase() === 'tba' || s.toLowerCase() === 'tbd' || s === '-') {
    return null
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  // Already YYYY-MM
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`

  // Plain year
  if (/^\d{4}$/.test(s)) return `${s}-01-01`

  // ISO date with time: 2024-01-15T00:00:00
  const isoMatch = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (isoMatch) return isoMatch[1]

  return null
}

/**
 * Get cell value safely from row
 */
function getCellValue(row: string[], index: number | undefined): string {
  if (index === undefined || index < 0 || index >= row.length) return ''
  return (row[index] || '').trim()
}

/**
 * Map an Epoch.ai CSV row to our Model format
 */
export function mapEpochRow(row: string[], colMap: Record<string, number>): Model | null {
  const name = getCellValue(row, colMap.name)
  const org = getCellValue(row, colMap.org)
  const rawDate = getCellValue(row, colMap.date)
  const rawParams = getCellValue(row, colMap.params)
  const accessibility = getCellValue(row, colMap.license)
  const desc = getCellValue(row, colMap.desc)

  const date = normalizeEpochDate(rawDate)

  if (!name || !org || !date) {
    return null // Skip rows without required fields
  }

  // Build params string
  let params: string | null = null
  if (rawParams) {
    // Try to parse as number
    const numParams = parseFloat(rawParams.replace(/,/g, ''))
    if (!isNaN(numParams)) {
      params = convertEpochParams(numParams)
    } else {
      // Use as-is if already formatted
      params = rawParams || null
    }
  }

  // Map accessibility to license type
  const license = mapEpochAccessibility(accessibility)

  // Collect optional Epoch metadata
  const epoch: Model['epoch'] = {
    domain: getCellValue(row, colMap.domain) || undefined,
    task: getCellValue(row, colMap.task) || undefined,
    approach: getCellValue(row, colMap.approach) || undefined,
    trainingCompute: (() => {
      const val = getCellValue(row, colMap.trainingCompute)
      const num = parseFloat(val.replace(/,/g, ''))
      return isNaN(num) ? undefined : num
    })(),
    trainingHardware: getCellValue(row, colMap.trainingHardware) || undefined,
    trainingDataset: getCellValue(row, colMap.trainingDataset) || undefined,
    modelAccessibility: getCellValue(row, colMap.modelAccessibility) || undefined,
    link: getCellValue(row, colMap.link) || undefined,
    authors: getCellValue(row, colMap.authors) || undefined,
  }

  // Remove undefined values from epoch metadata
  const cleanedEpoch: Model['epoch'] = Object.fromEntries(
    Object.entries(epoch).filter(([_, v]) => v !== undefined)
  ) as Model['epoch']

  return {
    name,
    date,
    org,
    params,
    type: 'model', // Epoch data doesn't distinguish milestones
    license,
    desc: desc || `AI model by ${org}`,
    source: 'epoch',
    epoch: cleanedEpoch && Object.keys(cleanedEpoch).length > 0 ? cleanedEpoch : undefined,
  }
}
