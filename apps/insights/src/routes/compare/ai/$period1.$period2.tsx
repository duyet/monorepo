import { createFileRoute } from "@tanstack/react-router";
import { ogMeta } from "@duyet/config/og";
import { SITE_OG_IMAGE, SITE_URL } from "@/lib/site";
import {
  formatCCost,
  formatCCTokens,
  getCCUsageComparison,
} from "@/app/ai/ccusage-comparison-utils";
import { ComparisonMetrics } from "@/components/comparison";
import { getPeriodLabel } from "@/lib/comparison";
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
  head: ({ loaderData, params }) => {
    const label1 = loaderData?.config1?.label ?? "";
    const label2 = loaderData?.config2?.label ?? "";
    const title = `AI Usage Comparison: ${label1} vs ${label2}`;
    const description = `Compare Claude Code usage between ${label1} and ${label2}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...ogMeta({
          url: `${SITE_URL}/compare/ai/${params.period1}/${params.period2}`,
          title,
          description,
          image: SITE_OG_IMAGE,
        }),
      ],
    };
  },
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

  const period1Label = getPeriodLabel(days1);
  const period2Label = getPeriodLabel(days2);

  return (
    <div>
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
            period1Label={period1Label}
            period2Label={period2Label}
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
          <p className="mt-6 text-xs italic text-muted-foreground">
            Data from ClickHouse • Positive values indicate increase in{" "}
            {period1Label} compared to {period2Label}
          </p>
        </InsightsSection>
      )}
    </div>
  );
}
