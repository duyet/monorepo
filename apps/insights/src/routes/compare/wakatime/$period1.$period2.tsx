import { createFileRoute } from "@tanstack/react-router";
import { getWakaTimeComparison } from "@/app/wakatime/wakatime-comparison-utils";
import { ComparisonMetrics } from "@/components/comparison";
import type { PeriodDays } from "@/lib/periods";
import { getPeriodConfig, getPeriodDays, isPeriodValue } from "@/lib/periods";
import {
  InsightsNotice,
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";

export const Route = createFileRoute("/compare/wakatime/$period1/$period2")({
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

    const comparison = await getWakaTimeComparison(days1, days2);
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
        title: `WakaTime Comparison: ${loaderData?.config1?.label ?? ""} vs ${loaderData?.config2?.label ?? ""}`,
      },
      {
        name: "description",
        content: `Compare coding activity between ${loaderData?.config1?.label ?? ""} and ${loaderData?.config2?.label ?? ""}`,
      },
    ],
  }),
  component: WakaTimeComparisonPage,
});

function WakaTimeComparisonPage() {
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

  const period1Label = days1 === "all" ? "All time" : `${days1} days`;
  const period2Label = days2 === "all" ? "All time" : `${days2} days`;

  return (
    <div className="space-y-6">
      <InsightsPageHeader
        badge="Compare • WakaTime"
        title="Coding analytics comparison"
        description={`Comparing coding activity between ${config1?.label} and ${config2?.label}.`}
      />

      {!comparison ? (
        <InsightsNotice
          title="Data unavailable"
          body="WakaTime data is not available for the selected periods."
        />
      ) : (
        <InsightsSection
          title="Metrics comparison"
          description="Period-over-period comparison of key coding metrics."
        >
          <ComparisonMetrics
            period1Label={period1Label}
            period2Label={period2Label}
            metrics={[
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
              },
            ]}
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Data from WakaTime • Positive values indicate increase in{" "}
            {period1Label} compared to {period2Label}
          </p>
        </InsightsSection>
      )}
    </div>
  );
}
