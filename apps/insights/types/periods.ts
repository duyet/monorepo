export type TimePeriod = "7d" | "30d" | "90d" | "6m" | "1y";

export interface TimePeriodOption {
  value: TimePeriod;
  label: string;
  days: number;
}

export const TIME_PERIODS: TimePeriodOption[] = [
  { value: "7d", label: "7 days", days: 7 },
  { value: "30d", label: "30 days", days: 30 },
  { value: "90d", label: "90 days", days: 90 },
  { value: "6m", label: "6 months", days: 180 },
  { value: "1y", label: "1 year", days: 364 }, // Limit to 364 days to avoid Cloudflare quota errors
];

export const DEFAULT_PERIOD: TimePeriod = "30d";

export interface PeriodData<T> {
  "7d": T;
  "30d": T;
  "90d": T;
  "6m": T;
  "1y": T;
  generatedAt: string;
}
