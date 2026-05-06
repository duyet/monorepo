/**
 * Comparison metrics display component
 * Shows side-by-side metrics with delta calculations
 */

"use client";

import { cn } from "@duyet/libs/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ComparisonDelta } from "@/lib/comparison";

export interface ComparisonMetricItem {
  label: string;
  value1: string;
  value2: string;
  delta?: ComparisonDelta;
  format?: "number" | "currency" | "percentage" | "duration";
}

export interface ComparisonMetricsProps {
  period1Label: string;
  period2Label: string;
  metrics: ComparisonMetricItem[];
  className?: string;
}

function DeltaBadge({ delta }: { delta: ComparisonDelta }) {
  const Icon =
    delta.trend === "up"
      ? TrendingUp
      : delta.trend === "down"
        ? TrendingDown
        : Minus;
  const colorClass =
    delta.trend === "up"
      ? "text-green-600 dark:text-green-400"
      : delta.trend === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <div className={cn("flex items-center gap-1 text-xs", colorClass)}>
      <Icon className="h-3 w-3" />
      <span>
        {delta.trend === "up" ? "+" : delta.trend === "down" ? "" : ""}
        {delta.percentageChange.toFixed(1)}%
      </span>
    </div>
  );
}

export function ComparisonMetrics({
  period1Label,
  period2Label,
  metrics,
  className,
}: ComparisonMetricsProps) {
  return (
    <div className={cn("rounded-xl p-6", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="pb-3 text-left text-sm font-medium">Metric</th>
            <th className="pb-3 text-right text-sm font-medium">
              {period1Label}
            </th>
            <th className="pb-3 text-right text-sm font-medium">
              {period2Label}
            </th>
            <th className="pb-3 text-right text-sm font-medium">Change</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-3 text-sm">{metric.label}</td>
              <td className="py-3 text-right text-sm font-medium tabular-nums">
                {metric.value1}
              </td>
              <td className="py-3 text-right text-sm text-muted-foreground tabular-nums">
                {metric.value2}
              </td>
              <td className="py-3 text-right">
                {metric.delta ? <DeltaBadge delta={metric.delta} /> : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
