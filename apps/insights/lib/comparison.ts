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
 * Human label for a period, e.g. "All time" or "30 days". Shared by the
 * comparison routes so both render the same wording.
 */
export function getPeriodLabel(days: number | "all"): string {
  return days === "all" ? "All time" : `${days} days`;
}
