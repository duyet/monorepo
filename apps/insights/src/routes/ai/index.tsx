import { createFileRoute } from "@tanstack/react-router";
import type { DateRangeDays } from "@/app/ai/types";
import { CCUsageActivityView } from "@/app/ai/activity";
import { CCUsageCostsView } from "@/app/ai/costs";
import { CCUsageDailyTableView } from "@/app/ai/daily-table";
import { CCUsageMetricsView } from "@/app/ai/metrics";
import { CCUsageModelsView } from "@/app/ai/models";
import {
  getCCUsageActivity,
  getCCUsageActivityByModel,
  getCCUsageActivityRaw,
  getCCUsageCosts,
  getCCUsageMetrics,
  getCCUsageModels,
} from "@/app/ai/utils/data-fetchers";
import { DEFAULT_PERIOD, getPeriodDays } from "@/lib/periods";

const STATIC_DAYS: DateRangeDays = getPeriodDays(DEFAULT_PERIOD) as DateRangeDays;

export const Route = createFileRoute("/ai/")({
  loader: async () => {
    const days = STATIC_DAYS;
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
      metrics:
        metrics.status === "fulfilled"
          ? metrics.value
          : null,
      activity: activity.status === "fulfilled" ? activity.value : [],
      activityByModel:
        activityByModel.status === "fulfilled" ? activityByModel.value : [],
      models: models.status === "fulfilled" ? models.value : [],
      costs: costs.status === "fulfilled" ? costs.value : [],
      activityRaw:
        activityRaw.status === "fulfilled" ? activityRaw.value : [],
    };
  },
  head: () => ({
    meta: [
      { title: "AI Usage Analytics" },
      {
        name: "description",
        content:
          "AI usage analytics, token consumption, and model insights from Claude Code",
      },
    ],
  }),
  component: AiPage,
});

function AiPage() {
  const { days, metrics, activity, activityByModel, models, costs, activityRaw } =
    Route.useLoaderData();

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          AI Usage Analytics
        </h1>
        <p className="mt-1 text-muted-foreground">
          Claude Code usage patterns, token consumption, and model insights
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Note: This is a cost simulation calculated based on token consumption.
          I am currently using Claude Code MAX ($100) + ZAI Pro so this does not
          reflect actual charges
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Usage Overview</h2>
            <p className="text-sm text-muted-foreground">
              Token consumption and activity summary
            </p>
          </div>
          <CCUsageMetricsView rawMetrics={metrics} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Daily Activity</h2>
            <p className="text-sm text-muted-foreground">
              Token usage patterns
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
            <h2 className="text-lg font-semibold">Daily Costs</h2>
            <p className="text-sm text-muted-foreground">
              Cost breakdown and spending patterns
            </p>
          </div>
          <CCUsageCostsView costs={costs} days={days} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Daily Usage Detail</h2>
            <p className="text-sm text-muted-foreground">
              Complete daily breakdown of tokens and costs
            </p>
          </div>
          <CCUsageDailyTableView activity={activityRaw} days={days} />
        </div>

        <p className="text-xs text-muted-foreground">
          Data Source: Claude Code | Last updated:{" "}
          {new Date().toISOString().slice(0, 10)}
        </p>
      </div>
    </div>
  );
}
