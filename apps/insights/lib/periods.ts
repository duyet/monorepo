/**
 * Shared time period configuration for all analytics tabs
 */

export type PeriodValue = "7" | "30" | "365" | "all";
export type PeriodDays = 7 | 30 | 365 | "all";

export interface PeriodConfig {
  value: PeriodValue;
  label: string;
  days: PeriodDays;
  description?: string;
}

export const PERIODS: PeriodConfig[] = [
  {
    value: "7",
    label: "7 days",
    days: 7,
    description: "Last week",
  },
  {
    value: "30",
    label: "30 days",
    days: 30,
    description: "Last month",
  },
  {
    value: "365",
    label: "12 months",
    days: 365,
    description: "Last year",
  },
  {
    value: "all",
    label: "All",
    days: "all",
    description: "All time",
  },
];

export const DEFAULT_PERIOD: PeriodValue = "30";

export function getPeriodConfig(value: string): PeriodConfig {
  return (
    PERIODS.find((p) => p.value === value) ||
    PERIODS.find((p) => p.value === DEFAULT_PERIOD)!
  );
}

export function getPeriodDays(value: string): PeriodDays {
  return getPeriodConfig(value).days;
}

export function isPeriodValue(value: string): value is PeriodValue {
  return PERIODS.some((p) => p.value === value);
}

/**
 * Get all period values for static generation
 */
export function getAllPeriodValues(): PeriodValue[] {
  return PERIODS.map((p) => p.value);
}

/**
 * Generate static params for all periods
 */
export function generatePeriodStaticParams() {
  return PERIODS.map((p) => ({ period: p.value }));
}
