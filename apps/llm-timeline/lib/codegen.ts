import type { DataSourceAdapter, MergeStats, Model } from './types'

/**
 * Escape a string for embedding in a TypeScript single-quoted literal.
 */
export function singleQuote(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
}

/**
 * Generate the full content of lib/data.ts from merged model data.
 */
export function generateDataTs(
  models: Model[],
  sources: DataSourceAdapter[],
  syncDate: string,
  stats: MergeStats,
): string {
  // Build merge stats line: "771 curated + 3156 epoch - 1 duplicates = 3926 total"
  const statsLine = Object.entries(stats.sources)
    .map(([name, count]) => `${count} ${name}`)
    .join(' + ')
    .concat(` - ${stats.duplicates} duplicates = ${stats.total} total`)

  // Build data sources block for the header comment
  const sourcesBlock = sources
    .map((s) => {
      const urlLines = s.urls.map((url) => ` *   ${url}`).join('\n')
      return ` *   ${s.label}:\n${urlLines}`
    })
    .join('\n')

  // Build each model entry
  const modelEntries = models
    .map((m) => {
      const lines: string[] = []
      lines.push(`    name: '${singleQuote(m.name)}'`)
      lines.push(`    date: '${singleQuote(m.date)}'`)
      lines.push(`    org: '${singleQuote(m.org)}'`)
      lines.push(`    params: ${m.params === null ? 'null' : `'${singleQuote(m.params)}'`}`)
      lines.push(`    type: '${m.type}'`)
      lines.push(`    license: '${m.license}'`)
      lines.push(`    desc: '${singleQuote(m.desc)}'`)
      if (m.source !== undefined) lines.push(`    source: '${singleQuote(m.source)}'`)
      if (m.domain !== undefined) lines.push(`    domain: '${singleQuote(m.domain)}'`)
      if (m.link !== undefined) lines.push(`    link: '${singleQuote(m.link)}'`)
      if (m.trainingCompute !== undefined)
        lines.push(`    trainingCompute: '${singleQuote(m.trainingCompute)}'`)
      if (m.trainingHardware !== undefined)
        lines.push(`    trainingHardware: '${singleQuote(m.trainingHardware)}'`)
      if (m.trainingDataset !== undefined)
        lines.push(`    trainingDataset: '${singleQuote(m.trainingDataset)}'`)
      if (m.authors !== undefined) lines.push(`    authors: '${singleQuote(m.authors)}'`)
      return `  {\n${lines.join(',\n')},\n  }`
    })
    .join(',\n')

  return `// @ts-nocheck — machine-generated file, types validated by Model interface
/**
 * LLM Timeline Data
 *
 * ============================================================================
 * LLM UPDATE INSTRUCTIONS
 * ============================================================================
 * To add a new model, append an object to the \`models\` array with:
 *   - name: Model name (e.g., "GPT-4o")
 *   - date: Release date as YYYY-MM-DD
 *   - org: Organization (e.g., "OpenAI", "Anthropic", "Google")
 *   - params: Parameter count as string or null (e.g., "175B", "1.8T (MoE)")
 *   - type: "model" for regular models, "milestone" for key events
 *   - license: "open" | "closed" | "partial"
 *   - desc: Brief description
 *   - source: data source origin (optional, e.g. 'curated', 'epoch')
 *
 * To update existing data, find the model by name and modify fields.
 *
 * Data sources:
${sourcesBlock}
 *
 * Merge stats: ${statsLine}
 * Last synced: ${syncDate}
 * ============================================================================
 */

export interface Model {
  name: string
  date: string // YYYY-MM-DD
  org: string
  params: string | null // e.g., "175B", "1.8T (MoE)"
  type: 'model' | 'milestone'
  license: 'open' | 'closed' | 'partial'
  desc: string
  source?: string
  domain?: string
  link?: string
  trainingCompute?: string
  trainingHardware?: string
  trainingDataset?: string
  authors?: string
}

export const models: Model[] = [
${modelEntries}
]

export const organizations: string[] = Array.from(new Set(models.map((m) => m.org))).sort()
export const domains: string[] = Array.from(
  new Set(
    models
      .filter(m => m.domain)
      .flatMap(m => m.domain!.split(',').map(d => d.trim()))
  )
).sort()
export const years: number[] = Array.from(new Set(models.map((m) => new Date(m.date).getFullYear()))).sort(
  (a, b) => b - a,
)
export const lastSynced = '${syncDate}'
`
}
