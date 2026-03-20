import { createFileRoute } from "@tanstack/react-router";
import type { PeriodDays } from "@/lib/periods";
import { getPeriodConfig, getPeriodDays } from "@/lib/periods";
import { StaticCard } from "@/components/StaticCard";
import { WakaTimeActivityView } from "@/app/wakatime/activity";
import { WakaTimeLanguagesView } from "@/app/wakatime/languages";
import { WakaTimeMetricsView } from "@/app/wakatime/metrics";
import {
  getWakaTimeActivityWithAI,
  getWakaTimeLanguages,
  getWakaTimeMetrics,
  getWakaTimeMonthlyActivity,
} from "@/app/wakatime/wakatime-utils";

export const Route = createFileRoute("/wakatime/$period")({
  loader: async ({ params }) => {
    const { period } = params;
    const config = getPeriodConfig(period);
    const days = getPeriodDays(period) as PeriodDays;
    const isAllTime = days === "all";

    const [metrics, activity, languages] = await Promise.allSettled([
      getWakaTimeMetrics(days),
      isAllTime ? getWakaTimeMonthlyActivity() : getWakaTimeActivityWithAI(days),
      getWakaTimeLanguages(days),
    ]);

    return {
      config,
      days,
      isAllTime,
      metrics:
        metrics.status === "fulfilled"
          ? metrics.value
          : { totalHours: 0, avgDailyHours: 0, daysActive: 0, topLanguage: "N/A" },
      activity: activity.status === "fulfilled" ? activity.value : [],
      languages: languages.status === "fulfilled" ? languages.value : [],
    };
  },
  head: ({ loaderData }) => {
    const config = loaderData?.config;
    const isAllTime = config?.days === "all";
    return {
      meta: [
        { title: `WakaTime Coding Analytics @duyet - ${config?.label ?? ""}` },
        {
          name: "description",
          content: isAllTime
            ? "All-time programming activity and coding insights"
            : `Programming activity for the last ${config?.label ?? ""}`,
        },
      ],
    };
  },
  component: WakaTimePeriodPage,
});

function WakaTimePeriodPage() {
  const { config, days, isAllTime, metrics, activity, languages } =
    Route.useLoaderData();

  const activityTitle = isAllTime ? "Monthly Activity" : "Daily Activity";
  const activityDescription = isAllTime
    ? "Coding all the time"
    : `Coding hours over the last ${config.label}`;
  const overviewDescription = isAllTime
    ? "All-time programming activity summary"
    : `Programming activity summary for the last ${config.label}`;

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Coding Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Programming activity and language statistics from WakaTime •{" "}
          {config.label}
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Coding Overview</h2>
            <p className="text-sm text-muted-foreground">
              {overviewDescription}
            </p>
          </div>
          <WakaTimeMetricsView metrics={metrics} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{activityTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {activityDescription}
            </p>
          </div>
          <WakaTimeActivityView codingActivity={activity} isAllTime={isAllTime} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Programming Languages</h2>
            <p className="text-sm text-muted-foreground">
              Language usage and distribution
            </p>
          </div>
          <WakaTimeLanguagesView languages={languages} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Yearly Activity</h2>
            <p className="text-sm text-muted-foreground">
              Annual coding activity heatmap
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <StaticCard
              extra={
                <img
                  alt="Wakatime Badge"
                  className="mt-3"
                  height={30}
                  src="https://wakatime.com/badge/user/8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9.svg"
                  width={200}
                />
              }
              source="WakaTime (Last Year)"
              title="Coding Activity Heatmap"
              url={{
                light:
                  "https://wakatime.com/share/@duyet/bf2b1851-7d8f-4c32-9033-f0ac18362d9e.svg",
                dark: "https://wakatime.com/share/@duyet/b7b8389a-04ba-402f-9095-b1748a5be49c.svg",
              }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Data from WakaTime • Updated daily
        </p>
      </div>
    </div>
  );
}
