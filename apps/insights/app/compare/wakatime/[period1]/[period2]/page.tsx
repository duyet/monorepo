/**
 * WakaTime period comparison page
 * Compares coding metrics between two time periods
 */

import { Suspense } from "react";
import type { PeriodDays } from "@/lib/periods";
import {
  getPeriodConfig,
  getPeriodDays,
  isPeriodValue,
} from "@/lib/periods";
import { generateComparisonStaticParams } from "@/lib/comparison";
import { ComparisonMetrics } from "@/components/comparison";
import { getWakaTimeComparison } from "../../../../wakatime/wakatime-comparison-utils";
import { SkeletonCard } from "@/components/SkeletonCard";

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
    title: `WakaTime Comparison: ${config1.label} vs ${config2.label}`,
    description: `Compare coding activity between ${config1.label} and ${config2.label}`,
  };
}

export default async function WakaTimeComparisonPage({ params }: PageProps) {
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
          Coding Analytics Comparison
        </h1>
        <p className="mt-1 text-muted-foreground">
          Comparing WakaTime coding activity: {config1.label} vs {config2.label}
        </p>
      </div>

      {/* Comparison Metrics */}
      <Suspense fallback={<SkeletonCard />}>
        <WakaTimeComparisonContent days1={days1} days2={days2} />
      </Suspense>
    </div>
  );
}

async function WakaTimeComparisonContent({
  days1,
  days2,
}: {
  days1: PeriodDays;
  days2: PeriodDays;
}) {
  const comparison = await getWakaTimeComparison(days1, days2);

  const metrics = [
    {
      label: "Total Hours",
      value1: comparison.totalHours.value1.toFixed(1),
      value2: comparison.totalHours.value2.toFixed(1),
      delta: comparison.totalHours.delta,
    },
    {
      label: "Daily Average",
      value1: comparison.avgDailyHours.value1.toFixed(1),
      value2: comparison.avgDailyHours.value2.toFixed(1),
      delta: comparison.avgDailyHours.delta,
    },
    {
      label: "Active Days",
      value1: comparison.daysActive.value1.toString(),
      value2: comparison.daysActive.value2.toString(),
      delta: comparison.daysActive.delta,
    },
    {
      label: "Top Language",
      value1: comparison.topLanguage.value1,
      value2: comparison.topLanguage.value2,
      // No delta for categorical data
    },
  ];

  // Get period labels
  const period1Label =
    days1 === "all" ? "All time" : `${days1} days`;
  const period2Label =
    days2 === "all" ? "All time" : `${days2} days`;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Metrics Comparison</h2>
      <ComparisonMetrics
        period1Label={period1Label}
        period2Label={period2Label}
        metrics={metrics}
      />
      <p className="mt-4 text-xs text-muted-foreground">
        Data from WakaTime • Positive values indicate increase in {period1Label} compared to {period2Label}
      </p>
    </div>
  );
}
