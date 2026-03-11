/**
 * WakaTime comparison utilities
 * Fetches and compares metrics between two periods
 */

import { calculateDelta } from "@/lib/comparison";
import { getWakaTimeMetrics } from "./wakatime-utils";

export interface WakaTimeComparisonMetrics {
  totalHours: {
    value1: number;
    value2: number;
    delta: ReturnType<typeof calculateDelta>;
  };
  avgDailyHours: {
    value1: number;
    value2: number;
    delta: ReturnType<typeof calculateDelta>;
  };
  daysActive: {
    value1: number;
    value2: number;
    delta: ReturnType<typeof calculateDelta>;
  };
  topLanguage: { value1: string; value2: string };
}

export async function getWakaTimeComparison(
  days1: number | "all",
  days2: number | "all"
): Promise<WakaTimeComparisonMetrics> {
  const [metrics1, metrics2] = await Promise.all([
    getWakaTimeMetrics(days1),
    getWakaTimeMetrics(days2),
  ]);

  return {
    totalHours: {
      value1: metrics1.totalHours,
      value2: metrics2.totalHours,
      delta: calculateDelta(metrics1.totalHours, metrics2.totalHours),
    },
    avgDailyHours: {
      value1: metrics1.avgDailyHours,
      value2: metrics2.avgDailyHours,
      delta: calculateDelta(metrics1.avgDailyHours, metrics2.avgDailyHours),
    },
    daysActive: {
      value1: metrics1.daysActive,
      value2: metrics2.daysActive,
      delta: calculateDelta(metrics1.daysActive, metrics2.daysActive),
    },
    topLanguage: {
      value1: metrics1.topLanguage,
      value2: metrics2.topLanguage,
    },
  };
}
