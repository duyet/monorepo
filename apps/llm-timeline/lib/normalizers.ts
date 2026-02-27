/**
 * Shared field normalization functions
 * Used by all data source adapters for consistent data formatting
 */

const MONTH_MAP: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

/**
 * Normalize a raw date string into YYYY-MM-DD format
 * Handles: YYYY-MM-DD, YYYY-MM, YYYY, Q1 2024, Jan 2024,
 *          Feb/2026, 2024-01-15T00:00:00, etc.
 */
export function normalizeDate(raw: string): string | null {
  const s = raw.trim()
  if (!s || s.toLowerCase() === 'tba' || s.toLowerCase() === 'tbd' || s === '-') return null

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  // ISO datetime: 2024-01-15T00:00:00 → 2024-01-15
  const isoMatch = s.match(/^(\d{4}-\d{2}-\d{2})T/)
  if (isoMatch) return isoMatch[1]

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

/**
 * Normalize parameter count strings
 * Handles: "175B", "1.8T", "~45B", "175 billion", plain numbers, etc.
 */
export function normalizeParams(raw: string): string | null {
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

/**
 * Normalize license/accessibility string to standard type
 */
export function normalizeLicense(raw: string): 'open' | 'closed' | 'partial' {
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

/**
 * Map accessibility string to license type (Epoch.ai format)
 */
export function mapAccessibility(accessibility: string): 'open' | 'closed' | 'partial' {
  const s = accessibility.toLowerCase().trim()

  if (s.includes('open') || s.includes('public') || s === 'yes' || s === 'true') return 'open'
  if (s.includes('closed') || s.includes('private') || s === 'no' || s === 'false') return 'closed'
  if (s.includes('partial') || s.includes('research') || s.includes('limited')) return 'partial'

  return 'closed'
}

/**
 * Normalize model type string
 */
export function normalizeType(raw: string): 'model' | 'milestone' {
  const s = raw.trim().toLowerCase()
  if (/milestone|event|paper|architecture|announcement|breakthrough/.test(s)) return 'milestone'
  return 'model'
}

/**
 * Normalize text: collapse whitespace, trim
 */
export function normalizeText(raw: string): string {
  return raw.replace(/[\n\r]/g, ' ').trim().replace(/\s+/g, ' ')
}

/**
 * Convert parameter count from float to readable format
 * e.g., 175000000000.0 → "175B", 1000000000.0 → "1B"
 */
export function convertNumericParams(floatValue: number | string): string | null {
  if (!floatValue || floatValue === '' || floatValue === '0') return null

  const num = typeof floatValue === 'string' ? parseFloat(floatValue) : floatValue
  if (isNaN(num) || num === 0) return null

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

/**
 * Format a FLOP count as a readable string
 * e.g., 1.2e25 → "1.2e25 FLOP"
 */
export function formatTrainingCompute(flop: number): string {
  if (flop >= 1e15) {
    const exp = Math.floor(Math.log10(flop))
    const mantissa = flop / Math.pow(10, exp)
    return mantissa === 1 ? `1e${exp}` : `${mantissa.toFixed(1)}e${exp}`
  }
  return `${flop}`
}
