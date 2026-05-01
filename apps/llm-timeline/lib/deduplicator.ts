/**
 * Merge and de-duplicate models from N data sources
 * Higher priority sources win on duplicates
 *
 * Core merge logic runs in Rust/WASM for performance.
 */

import type { DataSourceAdapter, MergeStats, Model } from "./types";
import { callCli } from "@duyet/libs/native-cli";

export interface SourceResult {
  source: DataSourceAdapter;
  models: Model[];
}

/**
 * Merge models from N data sources, deduplicating by key
 *
 * Delegates to the Rust/WASM dedup module. Serializes only the fields
 * the WASM function needs (source name + priority, model objects).
 */
export function mergeAllSources(results: SourceResult[]): {
  models: Model[];
  stats: MergeStats;
} {
  const wasmInput = results.map(({ source, models }) => ({
    source: { name: source.name, priority: source.priority },
    models,
  }));

  const json = callCli<{ models: Model[]; stats: MergeStats }>("dedup", wasmInput);

  return json;
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
