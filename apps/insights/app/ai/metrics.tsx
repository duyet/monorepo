import {
  Brain,
  Calendar,
  Database,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { CompactMetric } from "@/components/ui/CompactMetric";
import type { CCUsageMetricsData } from "./types";
import { formatCurrency } from "./utils/formatting";

function formatTokens(tokens: number): string {
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
}

export function CCUsageMetricsView({
  rawMetrics,
  className,
}: {
  rawMetrics: CCUsageMetricsData | null;
  className?: string;
}) {
  if (!rawMetrics) {
    return (
      <div className={`text-center text-muted-foreground ${className || ""}`}>
        No metrics available
      </div>
    );
  }

  // Process metrics data with computed derived values (converted from hook)
  const metrics = {
    ...rawMetrics,
    // Add computed properties
    cacheEfficiency:
      rawMetrics.totalTokens > 0
        ? (rawMetrics.cacheTokens / rawMetrics.totalTokens) * 100
        : 0,
    averageCostPerToken:
      rawMetrics.totalTokens > 0
        ? rawMetrics.totalCost / rawMetrics.totalTokens
        : 0,
    costPerDay:
      rawMetrics.activeDays > 0
        ? rawMetrics.totalCost / rawMetrics.activeDays
        : 0,
    // Projected monthly cost based on current usage pattern
    projectedMonthlyCost:
      rawMetrics.activeDays > 0
        ? (rawMetrics.totalCost / rawMetrics.activeDays) * 30
        : 0,
  };

  return (
    <div className={`grid grid-cols-2 gap-4 lg:grid-cols-5 ${className || ""}`}>
      <CompactMetric
        label="Total Tokens"
        value={formatTokens(metrics.totalTokens)}
        icon={<Database className="h-4 w-4" />}
      />
      <CompactMetric
        label="Total Cost"
        value={formatCurrency(metrics.totalCost)}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <CompactMetric
        label="Active Days"
        value={metrics.activeDays.toString()}
        icon={<Calendar className="h-4 w-4" />}
      />
      <CompactMetric
        label="Top Model"
        value={metrics.topModel}
        icon={<Brain className="h-4 w-4" />}
      />
      <CompactMetric
        label="Monthly Projection"
        value={formatCurrency(metrics.projectedMonthlyCost)}
        icon={<TrendingUp className="h-4 w-4" />}
        tooltip="Projected cost based on current usage pattern (30 days)"
      />
    </div>
  );
}
