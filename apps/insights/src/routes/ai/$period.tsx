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
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          AI Usage Analytics
        </h1>
        <p className="mt-1 text-muted-foreground">
          Claude Code usage patterns, token consumption, and model insights
          {config?.label ? ` • ${config.label}` : ""}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Claude Code current subscription $100
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Usage Overview</h2>
            <p className="text-sm text-muted-foreground">
              {isAllTime
                ? "All-time token consumption and activity summary"
                : `Usage overview for the last ${config?.label}`}
            </p>
          </div>
          <CCUsageMetricsView rawMetrics={metrics} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{activityTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {isAllTime
                ? "All-time token usage patterns"
                : `Token usage patterns for the last ${config?.label}`}
            </p>
          </div>
          <CCUsageActivityView
            activity={activity}
            activityByModel={activityByModel}
          />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">AI Model Usage</h2>
            <p className="text-sm text-muted-foreground">
              Model distribution and usage patterns
            </p>
          </div>
          <CCUsageModelsView models={models} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{costsTitle}</h2>
            <p className="text-sm text-muted-foreground">
              Cost breakdown and spending patterns
            </p>
          </div>
          <CCUsageCostsView costs={costs} days={days} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{tableTitle}</h2>
            <p className="text-sm text-muted-foreground">
              Complete breakdown of tokens and costs
            </p>
          </div>
          <CCUsageDailyTableView activity={activityRaw} days={days} />
        </div>

        <p className="text-xs text-muted-foreground">
          Claude Code Usage Analytics
        </p>
      </div>
    </div>
  );
}
