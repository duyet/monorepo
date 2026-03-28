import { SectionLayout } from "@/components/layouts";
import { DEFAULT_PERIOD, getPeriodDays } from "@/lib/periods";
import { CCUsageActivityView } from "./activity";
import { CCUsageCostsView } from "./costs";
import { CCUsageDailyTableView } from "./daily-table";
import { CCUsageErrorBoundary } from "./error-boundary";
import { CCUsageMetricsView } from "./metrics";
import { CCUsageModelsView } from "./models";
import type { DateRangeDays } from "./types";

// Data fetchers
import {
  getCCUsageActivity,
  getCCUsageActivityByModel,
  getCCUsageActivityRaw,
  getCCUsageCosts,
  getCCUsageMetrics,
  getCCUsageModels,
} from "./utils/data-fetchers";

export const metadata = {
  title: "AI Usage Analytics",
  description:
    "AI usage analytics, token consumption, and model insights from Claude Code",
};

// Static generation
export const dynamic = "force-static";

// Default is 30 days
const STATIC_DAYS: DateRangeDays = getPeriodDays(
  DEFAULT_PERIOD
) as DateRangeDays;

export default async function CCUsage() {
  // Fetch all data in parallel
  const [metrics, activity, activityByModel, models, costs, dailyActivity] =
    await Promise.all([
      getCCUsageMetrics(STATIC_DAYS),
      getCCUsageActivity(STATIC_DAYS),
      getCCUsageActivityByModel(STATIC_DAYS),
      getCCUsageModels(STATIC_DAYS),
      getCCUsageCosts(STATIC_DAYS),
      getCCUsageActivityRaw(STATIC_DAYS),
    ]);

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Main Content */}
      <div className="space-y-8">
        <CCUsageErrorBoundary>
          <SectionLayout
            title="Usage Overview"
            description="Token consumption and activity summary"
          >
            <CCUsageMetricsView rawMetrics={metrics} />
          </SectionLayout>
        </CCUsageErrorBoundary>

        <CCUsageErrorBoundary>
          <SectionLayout
            title="Daily Activity"
            description="Token usage patterns"
          >
            <CCUsageActivityView
              activity={activity}
              activityByModel={activityByModel}
            />
          </SectionLayout>
        </CCUsageErrorBoundary>

        <CCUsageErrorBoundary>
          <SectionLayout
            title="AI Model Usage"
            description="Model distribution and usage patterns"
          >
            <CCUsageModelsView models={models} />
          </SectionLayout>
        </CCUsageErrorBoundary>

        <CCUsageErrorBoundary>
          <SectionLayout
            title="Daily Costs"
            description="Cost breakdown and spending patterns"
          >
            <CCUsageCostsView costs={costs} days={STATIC_DAYS} />
          </SectionLayout>
        </CCUsageErrorBoundary>

        <CCUsageErrorBoundary>
          <SectionLayout
            title="Daily Usage Detail"
            description="Complete daily breakdown of tokens and costs"
          >
            <CCUsageDailyTableView
              activity={dailyActivity}
              days={STATIC_DAYS}
            />
          </SectionLayout>
        </CCUsageErrorBoundary>

        <p className="text-xs text-muted-foreground">
          Data Source: Claude Code | Last updated:{" "}
          {new Date().toISOString().slice(0, 10)}
        </p>
      </div>
    </div>
  );
}
