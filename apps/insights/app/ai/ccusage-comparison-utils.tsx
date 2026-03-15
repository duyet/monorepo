/**
 * CCUsage comparison utilities
 * Fetches and compares AI metrics between two periods
 */

import { calculateDelta } from "@/lib/comparison";
import { getCCUsageMetrics } from "./utils";

export interface CCUsageComparisonMetrics {
  totalTokens: {
    value1: number;
    value2: number;
    delta: ReturnType<typeof calculateDelta>;
  };
  totalCost: {
    value1: number;
    value2: number;
    delta: ReturnType<typeof calculateDelta>;
  };
  activeDays: {
    value1: number;
    value2: number;
    delta: ReturnType<typeof calculateDelta>;
  };
  topModel: { value1: string; value2: string };
}

export async function getCCUsageComparison(
  days1: number | "all",
  days2: number | "all"
): Promise<CCUsageComparisonMetrics | null> {
  const [metrics1, metrics2] = await Promise.all([
    getCCUsageMetrics(days1),
    getCCUsageMetrics(days2),
  ]);

  if (!metrics1 || !metrics2) {
    return null;
  }

  return {
    totalTokens: {
      value1: metrics1.totalTokens,
      value2: metrics2.totalTokens,
      delta: calculateDelta(metrics1.totalTokens, metrics2.totalTokens),
    },
    totalCost: {
      value1: metrics1.totalCost,
      value2: metrics2.totalCost,
      delta: calculateDelta(metrics1.totalCost, metrics2.totalCost),
    },
    activeDays: {
      value1: metrics1.activeDays,
      value2: metrics2.activeDays,
      delta: calculateDelta(metrics1.activeDays, metrics2.activeDays),
    },
    topModel: {
      value1: metrics1.topModel,
      value2: metrics2.topModel,
    },
  };
}

export { formatNumber as formatCCTokens } from "@duyet/libs";
export { formatCurrency as formatCCost } from "./utils/formatting";
