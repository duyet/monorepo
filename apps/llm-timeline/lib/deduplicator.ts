/**
 * Merge and de-duplicate models from N data sources
 * Higher priority sources win on duplicates
 */

import type { Model, MergeStats, DataSourceAdapter } from "./types";

export interface SourceResult {
  source: DataSourceAdapter;
  models: Model[];
}

/**
 * Create a unique key for de-duplication
 * Uses normalized name, org, and date to identify duplicates
 */
export function createModelKey(model: Model): string {
  return `${model.name.toLowerCase().trim()}|${model.org.toLowerCase().trim()}|${model.date}`;
}

/**
 * Merge models from N data sources, deduplicating by key
 *
 * Strategy:
 * 1. Sort sources by priority descending (highest priority added first)
 * 2. For each model: add if key unseen, skip as duplicate otherwise
 * 3. Sort final list by date ascending
 */
export function mergeAllSources(results: SourceResult[]): {
  models: Model[];
  stats: MergeStats;
} {
  const seen = new Set<string>();
  const merged: Model[] = [];
  let duplicateCount = 0;

  const sorted = [...results].sort(
    (a, b) => b.source.priority - a.source.priority
  );

  for (const { models } of sorted) {
    for (const model of models) {
      const key = createModelKey(model);
      if (seen.has(key)) {
        duplicateCount++;
        continue;
      }
      seen.add(key);
      merged.push(model);
    }
  }

  merged.sort((a, b) => a.date.localeCompare(b.date));

  const sources: Record<string, number> = {};
  for (const { source, models } of results) {
    sources[source.name] = models.length;
  }

  const stats: MergeStats = {
    sources,
    duplicates: duplicateCount,
    total: merged.length,
  };

  return { models: merged, stats };
}

/**
 * Format merge statistics for display
 */
export function formatMergeStats(stats: MergeStats): string {
  const lines: string[] = [];
  lines.push(`Merge Statistics:`);
  for (const [name, count] of Object.entries(stats.sources)) {
    lines.push(`  ${name}: ${count}`);
  }
  lines.push(`  Duplicates removed: ${stats.duplicates}`);
  lines.push(`  Total unique models: ${stats.total}`);
  return lines.join("\n");
}
