/**
 * Custom hooks for CCUsage components
 * Provides reusable data fetching, formatting, and chart transformation logic
 */

import { useMemo } from "react";
import type {
  CCUsageActivityData,
  CCUsageCostData,
  CCUsageMetricsData,
  CCUsageModelData,
  CostChartData,
  FormatOptions,
  ModelChartData,
  TokenChartData,
  UseFormattedCurrency,
} from "./types";

// ============================================================================
// Currency Formatting Hook
// ============================================================================

/**
 * Hook for consistent currency and number formatting across components
 */
export function useFormattedCurrency(): UseFormattedCurrency {
  const format = useMemo(() => {
    return (amount: number, options: FormatOptions = {}) => {
      const { showSymbol = true } = options;

      if (amount === 0) return showSymbol ? "$0" : "0";
      if (amount < 0.01) return showSymbol ? "<$0.01" : "<0.01";
      if (amount < 1)
        return showSymbol ? `$${amount.toFixed(2)}` : amount.toFixed(2);
      if (amount < 10)
        return showSymbol ? `$${amount.toFixed(1)}` : amount.toFixed(1);
      return showSymbol
        ? `$${Math.round(amount)}`
        : Math.round(amount).toString();
    };
  }, []);

  const formatTokens = useMemo(() => {
    return (tokens: number) => {
      if (tokens >= 1000000000) {
        return `${(tokens / 1000000000).toFixed(1)}B`;
      }
      if (tokens >= 1000000) {
        return `${(tokens / 1000000).toFixed(1)}M`;
      }
      if (tokens >= 1000) {
        return `${(tokens / 1000).toFixed(1)}K`;
      }
      return tokens.toString();
    };
  }, []);

  return { format, formatTokens };
}

// ============================================================================
// Chart Data Transformation Hooks
// ============================================================================

/**
 * Transform activity data for token usage charts
 */
export function useTokenChartData(
  activity: CCUsageActivityData[]
): TokenChartData[] {
  return useMemo(() => {
    return activity.map((row) => ({
      date: row.date,
      "Input Tokens": row["Input Tokens"],
      "Output Tokens": row["Output Tokens"],
      "Cache Tokens": row["Cache Tokens"],
    }));
  }, [activity]);
}

/**
 * Transform cost data for cost breakdown charts
 */
export function useCostChartData(costs: CCUsageCostData[]): CostChartData[] {
  return useMemo(() => {
    return costs.map((row) => ({
      date: row.date,
      "Input Cost": row["Input Cost"],
      "Output Cost": row["Output Cost"],
      "Cache Cost": row["Cache Cost"],
    }));
  }, [costs]);
}

/**
 * Transform activity data for daily cost charts
 */
export function useDailyCostData(
  activity: CCUsageActivityData[]
): Array<{ date: string; "Total Cost": number }> {
  return useMemo(() => {
    return activity.map((row) => ({
      date: row.date,
      "Total Cost": row["Total Cost"],
    }));
  }, [activity]);
}

/**
 * Transform model data for horizontal bar charts
 */
export function useModelChartData(models: CCUsageModelData[]): {
  tokenChartData: ModelChartData[];
  costChartData: ModelChartData[];
} {
  return useMemo(() => {
    const tokenChartData = models.map((model) => ({
      name: model.name,
      percent: model.percent,
    }));

    const costChartData = models.map((model) => ({
      name: model.name,
      percent: model.costPercent,
    }));

    return { tokenChartData, costChartData };
  }, [models]);
}

// ============================================================================
// Date Range Utilities
// ============================================================================

/**
 * Standard date range configurations
 */
export const DATE_RANGES = [
  { label: "30 days", value: "30d", days: 30 as const },
  { label: "90 days", value: "90d", days: 90 as const },
  { label: "6 months", value: "6m", days: 180 as const },
  { label: "1 year", value: "1y", days: 365 as const },
  { label: "All time", value: "all", days: "all" as const },
];

/**
 * Get date range configuration by value
 */
export function useDateRange(value: string) {
  return useMemo(() => {
    return DATE_RANGES.find((range) => range.value === value) || DATE_RANGES[0];
  }, [value]);
}

// ============================================================================
// Data Processing Hooks
// ============================================================================

/**
 * Process metrics data with computed derived values
 */
export function useProcessedMetrics(data: CCUsageMetricsData | null) {
  return useMemo(() => {
    if (!data) return null;

    return {
      ...data,
      // Add computed properties
      cacheEfficiency:
        data.totalTokens > 0 ? (data.cacheTokens / data.totalTokens) * 100 : 0,
      averageCostPerToken:
        data.totalTokens > 0 ? data.totalCost / data.totalTokens : 0,
      costPerDay: data.activeDays > 0 ? data.totalCost / data.activeDays : 0,
    };
  }, [data]);
}

/**
 * Process cost data with summary calculations
 */
export function useProcessedCosts(data: CCUsageCostData[]) {
  return useMemo(() => {
    if (!data.length) {
      return {
        data,
        summary: { total: 0, average: 0, projected: 0 },
      };
    }

    const total = data.reduce((sum, day) => sum + day["Total Cost"], 0);
    const average = total / data.length;
    const projected = average * 30; // Monthly projection

    return {
      data,
      summary: { total, average, projected },
    };
  }, [data]);
}

// ============================================================================
// Model Name Processing
// ============================================================================

/**
 * Standardize model names for display
 */
export function useModelNameFormatter() {
  return useMemo(() => {
    return (modelName: string, maxLength = 15) => {
      if (modelName.length <= maxLength) return modelName;
      return `${modelName.substring(0, maxLength)}...`;
    };
  }, []);
}

// ============================================================================
// Error Handling Hook
// ============================================================================

/**
 * Standardized error state management for data components
 */
export function useErrorHandler() {
  return useMemo(() => {
    return {
      getErrorMessage: (error: unknown): string => {
        if (typeof error === "string") return error;
        if (error instanceof Error) return error.message;
        return "An unexpected error occurred";
      },

      isRetryableError: (error: unknown): boolean => {
        const message =
          typeof error === "string"
            ? error
            : error instanceof Error
              ? error.message
              : "";

        // Network errors are typically retryable
        return (
          message.includes("timeout") ||
          message.includes("connection") ||
          message.includes("network")
        );
      },
    };
  }, []);
}

// ============================================================================
// Performance Monitoring Hook
// ============================================================================

/**
 * Monitor component performance for large datasets
 */
export function usePerformanceMonitor(componentName: string, dataSize: number) {
  return useMemo(() => {
    const startTime = performance.now();

    return {
      logRenderTime: () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;

        if (renderTime > 100) {
          // Log if rendering takes more than 100ms
          console.warn(
            `[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms with ${dataSize} items`
          );
        }
      },
    };
  }, [componentName, dataSize]);
}
