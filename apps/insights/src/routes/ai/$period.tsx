import { createFileRoute } from "@tanstack/react-router";
import { CCUsageActivityView } from "@/app/ai/activity";
import { CCUsageCostsView } from "@/app/ai/costs";
import { CCUsageDailyTableView } from "@/app/ai/daily-table";
import { CCUsageMetricsView } from "@/app/ai/metrics";
import { CCUsageModelsView } from "@/app/ai/models";
import type { DateRangeDays } from "@/app/ai/types";
import {
  getCCUsageActivity,
  getCCUsageActivityByModel,
  getCCUsageActivityRaw,
  getCCUsageCosts,
  getCCUsageMetrics,
  getCCUsageModels,
} from "@/app/ai/utils/data-fetchers";
import { getPeriodConfig, getPeriodDays } from "@/lib/periods";
import {
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";

export const Route = createFileRoute("/ai/$period")({
  loader: async ({ params }) => {
    const { period } = params;
    const config = getPeriodConfig(period);
    const days = getPeriodDays(period) as DateRangeDays;

    const [metrics, activity, activityByModel, models, costs, activityRaw] =
      await Promise.allSettled([
        getCCUsageMetrics(days),
        getCCUsageActivity(days),
        getCCUsageActivityByModel(days),
        getCCUsageModels(days),
        getCCUsageCosts(days),
        getCCUsageActivityRaw(days),
      ]);

    return {
      days,
      config,
      metrics: metrics.status === "fulfilled" ? metrics.value : null,
      activity: activity.status === "fulfilled" ? activity.value : [],
      activityByModel:
        activityByModel.status === "fulfilled" ? activityByModel.value : [],
      models: models.status === "fulfilled" ? models.value : [],
      costs: costs.status === "fulfilled" ? costs.value : [],
      activityRaw: activityRaw.status === "fulfilled" ? activityRaw.value : [],
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `AI Usage Analytics - ${loaderData?.config?.label ?? ""}`,
      },
      {
        name: "description",
        content:
          loaderData?.config?.days === "all"
            ? "All-time AI usage analytics and insights"
            : `AI usage analytics for the last ${loaderData?.config?.label}`,
      },
    ],
  }),
  component: AiPeriodPage,
});

function AiPeriodPage() {
  const {
    days,
    config,
    metrics,
    activity,
    activityByModel,
    models,
    costs,
    activityRaw,
  } = Route.useLoaderData();

  const isAllTime = days === "all";
  const isLong = isAllTime || days === 365;

  const activityTitle = isLong ? "Monthly Activity" : "Daily Activity";
  const costsTitle = isLong ? "Monthly Costs" : "Daily Costs";
  const tableTitle = isLong ? "Monthly Usage Detail" : "Daily Usage Detail";

  return (
    <div className="space-y-6">
      <InsightsPageHeader
        badge={`AI • ${config?.label ?? "Period"}`}
        title="AI usage analytics"
        description="Token usage and model activity across the selected period."
      />

      <div className="space-y-6">
        <InsightsSection
          title="Usage overview"
          description={
            isAllTime
              ? "All-time token consumption and activity summary."
              : `Usage overview for the last ${config?.label}.`
          }
        >
          <CCUsageMetricsView rawMetrics={metrics} />
        </InsightsSection>

        <InsightsSection
          title={activityTitle}
          description={
            isAllTime
              ? "All-time token usage patterns."
              : `Token usage patterns for the last ${config?.label}.`
          }
        >
          <CCUsageActivityView
            activity={activity}
            activityByModel={activityByModel}
          />
        </InsightsSection>

        <InsightsSection
          title="AI model usage"
          description="Model distribution and usage patterns."
        >
          <CCUsageModelsView models={models} />
        </InsightsSection>

        <InsightsSection
          title={costsTitle}
          description="Estimated cost breakdown and spending patterns."
        >
          <CCUsageCostsView costs={costs} days={days} />
        </InsightsSection>

        <InsightsSection
          title={tableTitle}
          description="Complete breakdown of tokens and cost estimates."
        >
          <CCUsageDailyTableView activity={activityRaw} days={days} />
        </InsightsSection>

        <p className="text-xs text-muted-foreground">
          Claude Code Usage Analytics
        </p>
      </div>
    </div>
  );
}
