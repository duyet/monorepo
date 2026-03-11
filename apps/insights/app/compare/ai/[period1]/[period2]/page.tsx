/**
 * AI/CCUsage period comparison page
 * Compares AI usage metrics between two time periods
 */

import { Suspense } from "react";
import { ComparisonMetrics } from "@/components/comparison";
import { SkeletonCard } from "@/components/SkeletonCard";
import { generateComparisonStaticParams } from "@/lib/comparison";
import type { PeriodDays } from "@/lib/periods";
import { getPeriodConfig, getPeriodDays, isPeriodValue } from "@/lib/periods";
import {
  formatCCost,
  formatCCTokens,
  getCCUsageComparison,
} from "../../../../ai/ccusage-comparison-utils";

export const dynamic = "force-static";

// Generate static pages for all period combinations
export function generateStaticParams() {
  return generateComparisonStaticParams();
}

interface PageProps {
  params: Promise<{
    period1: string;
    period2: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { period1, period2 } = await params;
  const config1 = getPeriodConfig(period1);
  const config2 = getPeriodConfig(period2);

  return {
    title: `AI Usage Comparison: ${config1.label} vs ${config2.label}`,
    description: `Compare Claude Code usage between ${config1.label} and ${config2.label}`,
  };
}

export default async function AIComparisonPage({ params }: PageProps) {
  const { period1, period2 } = await params;

  // Validate periods
  if (!isPeriodValue(period1) || !isPeriodValue(period2)) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
        <h2 className="text-lg font-semibold">Invalid Period</h2>
        <p className="mt-2 text-sm">
          Please select valid time periods for comparison.
        </p>
      </div>
    );
  }

  const config1 = getPeriodConfig(period1);
  const config2 = getPeriodConfig(period2);
  const days1 = getPeriodDays(period1) as PeriodDays;
  const days2 = getPeriodDays(period2) as PeriodDays;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          AI Usage Comparison
        </h1>
        <p className="mt-1 text-muted-foreground">
          Comparing Claude Code usage: {config1.label} vs {config2.label}
        </p>
      </div>

      {/* Comparison Metrics */}
      <Suspense fallback={<SkeletonCard />}>
        <AIComparisonContent days1={days1} days2={days2} />
      </Suspense>
    </div>
  );
}

async function AIComparisonContent({
  days1,
  days2,
}: {
  days1: PeriodDays;
  days2: PeriodDays;
}) {
  const comparison = await getCCUsageComparison(days1, days2);

  if (!comparison) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100">
        <h2 className="text-lg font-semibold">Data Unavailable</h2>
        <p className="mt-2 text-sm">
          AI usage data is not available for the selected periods.
        </p>
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Tokens",
      value1: formatCCTokens(comparison.totalTokens.value1),
      value2: formatCCTokens(comparison.totalTokens.value2),
      delta: comparison.totalTokens.delta,
    },
    {
      label: "Total Cost",
      value1: formatCCost(comparison.totalCost.value1),
      value2: formatCCost(comparison.totalCost.value2),
      delta: comparison.totalCost.delta,
    },
    {
      label: "Active Days",
      value1: comparison.activeDays.value1.toString(),
      value2: comparison.activeDays.value2.toString(),
      delta: comparison.activeDays.delta,
    },
    {
      label: "Top Model",
      value1: comparison.topModel.value1,
      value2: comparison.topModel.value2,
      // No delta for categorical data
    },
  ];

  // Get period labels
  const period1Label = days1 === "all" ? "All time" : `${days1} days`;
  const period2Label = days2 === "all" ? "All time" : `${days2} days`;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Metrics Comparison</h2>
      <ComparisonMetrics
        period1Label={period1Label}
        period2Label={period2Label}
        metrics={metrics}
      />
      <p className="mt-4 text-xs text-muted-foreground">
        Data from ClickHouse • Positive values indicate increase in{" "}
        {period1Label} compared to {period2Label}
      </p>
    </div>
  );
}
