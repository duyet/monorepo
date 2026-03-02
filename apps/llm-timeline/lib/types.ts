/**
 * Core type definitions for LLM Timeline data
 * Supports N data sources via the DataSourceAdapter pattern
 */

export interface Model {
  name: string;
  date: string; // YYYY-MM-DD
  org: string;
  params: string | null; // e.g., "175B", "1.8T (MoE)"
  type: "model" | "milestone";
  license: "open" | "closed" | "partial";
  desc: string;
  source?: string; // Track data source origin (e.g., 'curated', 'epoch')

  // Optional metadata — any source can populate these
  domain?: string;
  link?: string;
  trainingCompute?: string; // Formatted FLOP string e.g. "1.2e25"
  trainingHardware?: string;
  trainingDataset?: string;
  authors?: string;
}

/**
 * Interface for pluggable data source adapters
 * Implement this to add a new data source to the sync pipeline
 */
export interface DataSourceAdapter {
  /** Unique identifier, e.g. 'curated', 'epoch' */
  name: string;
  /** Human-readable label, e.g. 'Google Sheets (curated)' */
  label: string;
  /** Higher priority wins on dedup (curated=100, epoch=50) */
  priority: number;
  /** Source URLs for help text */
  urls: string[];
  /** Fetch and parse models from this source */
  fetch(opts: { verbose?: boolean }): Promise<Model[]>;
}

/**
 * N-source merge statistics
 */
export interface MergeStats {
  sources: Record<string, number>; // e.g. { curated: 771, epoch: 3156 }
  duplicates: number;
  total: number;
}
