/**
 * Merge and de-duplicate models from multiple data sources
 * Epoch.ai is the priority source per user decision
 */

import type { Model, MergeStats } from './types'

/**
 * Create a unique key for de-duplication
 * Uses normalized name, org, and date to identify duplicates
 */
export function createModelKey(model: Model): string {
  return `${model.name.toLowerCase().trim()}|${model.org.toLowerCase().trim()}|${model.date}`
}

/**
 * Merge data from curated and epoch sources
 * Per user decision: epoch data wins on duplicates
 *
 * Strategy:
 * 1. Add all epoch models (priority source)
 * 2. Add curated models only if not duplicate
 * 3. Sort by date ascending
 */
export function mergeDataSources(
  curated: Model[],
  epoch: Model[]
): { models: Model[]; stats: MergeStats } {
  const seen = new Set<string>()
  const merged: Model[] = []
  let duplicateCount = 0

  // Add all epoch models first (priority source)
  for (const model of epoch) {
    const key = createModelKey(model)
    seen.add(key)
    merged.push(model)
  }

  // Add curated models only if not duplicate
  for (const model of curated) {
    const key = createModelKey(model)
    if (seen.has(key)) {
      duplicateCount++
      continue // Skip duplicate, epoch version wins
    }
    seen.add(key)
    merged.push(model)
  }

  // Sort by date ascending
  merged.sort((a, b) => a.date.localeCompare(b.date))

  const stats: MergeStats = {
    curated: curated.length,
    epoch: epoch.length,
    duplicates: duplicateCount,
    total: merged.length,
  }

  return { models: merged, stats }
}

/**
 * Format merge statistics for display
 */
export function formatMergeStats(stats: MergeStats): string {
  const lines: string[] = []
  lines.push(`Merge Statistics:`)
  lines.push(`  Curated models: ${stats.curated}`)
  lines.push(`  Epoch models: ${stats.epoch}`)
  lines.push(`  Duplicates removed: ${stats.duplicates}`)
  lines.push(`  Total unique models: ${stats.total}`)
  return lines.join('\n')
}
