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
import { DEFAULT_PERIOD, getPeriodDays } from "@/lib/periods";
import {
  InsightsNotice,
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";

const STATIC_DAYS: DateRangeDays = getPeriodDays(
  DEFAULT_PERIOD
) as DateRangeDays;

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
      metrics: metrics.status === "fulfilled" ? metrics.value : null,
      activity: activity.status === "fulfilled" ? activity.value : [],
      activityByModel:
        activityByModel.status === "fulfilled" ? activityByModel.value : [],
      models: models.status === "fulfilled" ? models.value : [],
      costs: costs.status === "fulfilled" ? costs.value : [],
      activityRaw: activityRaw.status === "fulfilled" ? activityRaw.value : [],
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
  const {
    days,
    metrics,
    activity,
    activityByModel,
    models,
    costs,
    activityRaw,
  } = Route.useLoaderData();

  return (
    <div>
      <InsightsPageHeader
        badge="AI"
        title="The tokens, the models, and what they cost."
        description="Claude Code usage patterns, token consumption, model mix, and estimated spend trends."
      />

      <div className="mb-12">
        <InsightsNotice
          title="Cost note"
          body="This is a token-based simulation view. It does not represent direct billing totals."
        />
      </div>

      <div>
        <InsightsSection
          title="Usage overview"
          description="Token consumption and activity summary."
        >
          <CCUsageMetricsView rawMetrics={metrics} />
        </InsightsSection>

        <InsightsSection
          title="Daily activity"
          description="Token usage patterns."
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
          title="Daily costs"
          description="Estimated spend breakdown."
        >
          <CCUsageCostsView costs={costs} days={days} />
        </InsightsSection>

        <InsightsSection
          title="Daily usage detail"
          description="Complete daily breakdown of tokens and cost estimates."
        >
          <CCUsageDailyTableView activity={activityRaw} days={days} />
        </InsightsSection>

        <p className="border-t pt-6 text-xs italic text-muted-foreground">
          Source: Claude Code &middot; updated{" "}
          {new Date().toISOString().slice(0, 10)}.
        </p>
      </div>
    </div>
  );
}
