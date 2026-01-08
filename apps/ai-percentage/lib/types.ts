export type DateRangeDays = number | "all";

export interface AICodePercentageData {
  date: string;
  ai_percentage: number;
  total_lines_added: number;
  human_lines_added: number;
  ai_lines_added: number;
  total_commits: number;
  human_commits: number;
  ai_commits: number;
}

export interface CurrentAICodePercentage {
  ai_percentage: number;
  total_lines_added: number;
  human_lines_added: number;
  ai_lines_added: number;
}

export interface DateRangeConfig {
  label: string;
  value: string;
  days: DateRangeDays;
}
