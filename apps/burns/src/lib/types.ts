export interface TokenTotals {
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  total_tokens: number;
  total_cost: number;
}

export interface DailyEntrySource {
  source: string;
  total_tokens: number;
  cost: number;
}

export interface DailyEntry {
  date: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  total_tokens: number;
  cost: number;
  by_source?: DailyEntrySource[];
}

/** All-time totals per coding agent (display name). */
export interface SourceTotal {
  source: string;
  total_tokens: number;
  cost: number;
}

export interface TokenData {
  generatedAt: string;
  firstDate: string | null;
  lastDate: string | null;
  sources: readonly string[];
  totals: TokenTotals;
  /** All-time per-agent usage for logo hover tooltips. */
  source_totals: SourceTotal[];
  daily: DailyEntry[];
}
