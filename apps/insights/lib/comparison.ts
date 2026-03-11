/**
 * Period comparison utilities
 * Calculates deltas and differences between two time periods
 */

export interface ComparisonDelta {
  value: number;
  previousValue: number;
  absoluteChange: number;
  percentageChange: number;
  trend: "up" | "down" | "neutral";
}

/**
 * Calculate comparison delta between two values
 */
export function calculateDelta(
  currentValue: number,
  previousValue: number
): ComparisonDelta {
  if (previousValue === 0) {
    return {
      value: currentValue,
      previousValue,
      absoluteChange: currentValue,
      percentageChange: currentValue > 0 ? 100 : 0,
      trend: currentValue > 0 ? "up" : "neutral",
    };
  }

  const absoluteChange = currentValue - previousValue;
  const percentageChange = (absoluteChange / previousValue) * 100;
  const trend =
    absoluteChange > 0 ? "up" : absoluteChange < 0 ? "down" : "neutral";

  return {
    value: currentValue,
    previousValue,
    absoluteChange,
    percentageChange,
    trend,
  };
}

/**
 * Format delta for display
 */
export function formatDelta(delta: ComparisonDelta): string {
  const sign = delta.trend === "up" ? "+" : delta.trend === "down" ? "-" : "";
  return `${sign}${delta.absoluteChange.toFixed(1)} (${sign}${delta.percentageChange.toFixed(1)}%)`;
}

/**
 * Calculate period dates based on period value
 */
export function getPeriodDates(days: number | "all"): { start: Date; end: Date } {
  const end = new Date();
  const start = days === "all" ? new Date(2020, 0, 1) : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * Generate static params for comparison pages
 * Creates all valid combinations of period pairs
 */
export function generateComparisonStaticParams() {
  const periods = ["7", "30", "365", "all"] as const;
  const params: { period1: string; period2: string }[] = [];

  for (const period1 of periods) {
    for (const period2 of periods) {
      // Only include combinations where period1 > period2 (comparing longer vs shorter period)
      if (period1 !== period2) {
        params.push({ period1, period2 });
      }
    }
  }

  return params;
}
