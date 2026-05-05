import { createFileRoute } from "@tanstack/react-router";
import {
  formatCCost,
  formatCCTokens,
  getCCUsageComparison,
} from "@/app/ai/ccusage-comparison-utils";
import { ComparisonMetrics } from "@/components/comparison";
import type { PeriodDays } from "@/lib/periods";
import { getPeriodConfig, getPeriodDays, isPeriodValue } from "@/lib/periods";
import {
  InsightsNotice,
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";

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
      <InsightsNotice
        tone="error"
        title="Invalid period"
        body="Please select valid time periods for comparison."
      />
    );
  }

  return (
    <div className="space-y-6">
      <InsightsPageHeader
        badge={`Compare • AI`}
        title="AI usage comparison"
        description={`Comparing Claude Code usage between ${config1?.label} and ${config2?.label}.`}
      />

      {!comparison ? (
        <InsightsNotice
          title="Data unavailable"
          body="AI usage data is not available for the selected periods."
        />
      ) : (
        <InsightsSection
          title="Metrics comparison"
          description="Period-over-period comparison of key AI usage metrics."
        >
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
        </InsightsSection>
      )}
    </div>
  );
}
