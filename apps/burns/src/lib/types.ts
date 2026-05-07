export interface TokenTotals {
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  total_tokens: number;
  total_cost: number;
}

export interface DailyEntry {
  date: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  total_tokens: number;
  cost: number;
}

export interface TokenData {
  generatedAt: string;
  totals: TokenTotals;
  daily: DailyEntry[];
}
