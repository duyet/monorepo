/**
 * Comparison metrics display component.
 * Editorial side-by-side diff: `value1 → value2` with a small delta below.
 */

"use client";

import { cn } from "@duyet/libs/utils";
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

function Delta({ delta }: { delta: ComparisonDelta }) {
  const sign =
    delta.trend === "up" ? "+" : delta.trend === "down" ? "−" : "±";
  const color =
    delta.trend === "neutral"
      ? "text-[color:var(--muted)]"
      : delta.trend === "up"
        ? "text-[color:var(--foreground)]"
        : "text-[color:var(--accent)]";
  return (
    <span className={cn("font-mono text-xs tabular-nums", color)}>
      {sign}
      {Math.abs(delta.percentageChange).toFixed(1)}%
    </span>
  );
}

export function ComparisonMetrics({
  period1Label,
  period2Label,
  metrics,
  className,
}: ComparisonMetricsProps) {
  return (
    <div className={cn("editorial-stagger flex flex-col", className)}>
      <div className="flex items-baseline gap-3 pb-4 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
        <span>{period1Label}</span>
        <span aria-hidden="true">&rarr;</span>
        <span>{period2Label}</span>
      </div>
      {metrics.map((metric, i) => (
        <div
          key={metric.label}
          className={cn(
            "grid grid-cols-1 gap-4 py-6 md:grid-cols-[1fr_2fr]",
            i === 0 ? "border-t border-[color:var(--hairline)]" : "",
            "border-b border-[color:var(--hairline)]"
          )}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
            {metric.label}
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-3 font-mono tabular-nums">
              <span className="text-3xl tracking-tight text-[color:var(--foreground)]">
                {metric.value1}
              </span>
              <span
                aria-hidden="true"
                className="text-xl text-[color:var(--subtle)]"
              >
                &rarr;
              </span>
              <span className="text-3xl tracking-tight text-[color:var(--muted)]">
                {metric.value2}
              </span>
            </div>
            {metric.delta ? <Delta delta={metric.delta} /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
