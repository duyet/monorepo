import { createFileRoute } from "@tanstack/react-router";
import {
  formatCCost,
  formatCCTokens,
  getCCUsageComparison,
} from "@/app/ai/ccusage-comparison-utils";
import { ComparisonMetrics } from "@/components/comparison";
import type { PeriodDays } from "@/lib/periods";
import { getPeriodConfig, getPeriodDays, isPeriodValue } from "@/lib/periods";

export const Route = createFileRoute("/compare/ai/$period1/$period2")({
  loader: async ({ params }) => {
    const { period1, period2 } = params;
    const config1 = getPeriodConfig(period1);
    const config2 = getPeriodConfig(period2);
    const days1 = getPeriodDays(period1) as PeriodDays;
    const days2 = getPeriodDays(period2) as PeriodDays;

    if (!isPeriodValue(period1) || !isPeriodValue(period2)) {
      return {
        period1,
        period2,
        config1,
        config2,
        days1,
        days2,
        comparison: null,
        invalid: true,
      };
    }

    const comparison = await getCCUsageComparison(days1, days2);
    return {
      period1,
      period2,
      config1,
      config2,
      days1,
      days2,
      comparison,
      invalid: false,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `AI Usage Comparison: ${loaderData?.config1?.label ?? ""} vs ${loaderData?.config2?.label ?? ""}`,
      },
      {
        name: "description",
        content: `Compare Claude Code usage between ${loaderData?.config1?.label ?? ""} and ${loaderData?.config2?.label ?? ""}`,
      },
    ],
  }),
  component: AIComparisonPage,
});

function AIComparisonPage() {
  const { config1, config2, days1, days2, comparison, invalid } =
    Route.useLoaderData();

  if (invalid) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
        <h2 className="text-lg font-semibold">Invalid Period</h2>
        <p className="mt-2 text-sm">
          Please select valid time periods for comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          AI Usage Comparison
        </h1>
        <p className="mt-1 text-muted-foreground">
          Comparing Claude Code usage: {config1?.label} vs {config2?.label}
        </p>
      </div>

      {!comparison ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100">
          <h2 className="text-lg font-semibold">Data Unavailable</h2>
          <p className="mt-2 text-sm">
            AI usage data is not available for the selected periods.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Metrics Comparison</h2>
          <ComparisonMetrics
            period1Label={days1 === "all" ? "All time" : `${days1} days`}
            period2Label={days2 === "all" ? "All time" : `${days2} days`}
            metrics={[
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
              },
            ]}
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Data from ClickHouse • Positive values indicate increase in{" "}
            {days1 === "all" ? "All time" : `${days1} days`} compared to{" "}
            {days2 === "all" ? "All time" : `${days2} days`}
          </p>
        </div>
      )}
    </div>
  );
}
