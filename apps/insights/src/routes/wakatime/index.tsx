import { createFileRoute } from "@tanstack/react-router";
import { WakaTimeActivityView } from "@/app/wakatime/activity";
import { WakaTimeHourlyHeatmapView } from "@/app/wakatime/hourly-heatmap";
import { WakaTimeLanguagesView } from "@/app/wakatime/languages";
import { WakaTimeMetricsView } from "@/app/wakatime/metrics";
import { WakaTimeMonthlyTrendView } from "@/app/wakatime/monthly-trend";
import {
  getWakaTimeActivityWithAI,
  getWakaTimeHourlyHeatmap,
  getWakaTimeLanguages,
  getWakaTimeMetrics,
  getWakaTimeMonthlyTrend,
} from "@/app/wakatime/wakatime-utils";
import { StaticCard } from "@/components/StaticCard";
import type { PeriodDays } from "@/lib/periods";
import { DEFAULT_PERIOD, getPeriodDays } from "@/lib/periods";

const STATIC_DAYS: PeriodDays = getPeriodDays(DEFAULT_PERIOD) as PeriodDays;

export const Route = createFileRoute("/wakatime/")({
  loader: async () => {
    const days = STATIC_DAYS;
    const [metrics, activity, languages, monthlyTrend, heatmap] =
      await Promise.allSettled([
        getWakaTimeMetrics(days),
        getWakaTimeActivityWithAI(days),
        getWakaTimeLanguages(days),
        getWakaTimeMonthlyTrend(),
        getWakaTimeHourlyHeatmap(),
      ]);

    return {
      days,
      metrics:
        metrics.status === "fulfilled"
          ? metrics.value
          : {
              totalHours: 0,
              avgDailyHours: 0,
              daysActive: 0,
              topLanguage: "N/A",
            },
      activity: activity.status === "fulfilled" ? activity.value : [],
      languages: languages.status === "fulfilled" ? languages.value : [],
      monthlyTrend:
        monthlyTrend.status === "fulfilled" ? monthlyTrend.value : [],
      heatmap: heatmap.status === "fulfilled" ? heatmap.value : [],
    };
  },
  head: () => ({
    meta: [
      { title: "WakaTime Coding Analytics @duyet" },
      {
        name: "description",
        content:
          "Programming activity, language statistics, and coding insights from WakaTime",
      },
    ],
  }),
  component: WakatimePage,
});

function WakatimePage() {
  const { metrics, activity, languages, monthlyTrend, heatmap } =
    Route.useLoaderData();

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Coding Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Programming activity and language statistics from WakaTime
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Coding Overview</h2>
            <p className="text-sm text-muted-foreground">
              Programming activity summary for the last 30 days
            </p>
          </div>
          <WakaTimeMetricsView metrics={metrics} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Daily Activity</h2>
            <p className="text-sm text-muted-foreground">
              Coding hours over the last 30 days
            </p>
          </div>
          <WakaTimeActivityView codingActivity={activity} />
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
            <h2 className="text-lg font-semibold">Long-term Trends</h2>
            <p className="text-sm text-muted-foreground">
              Historical coding activity over multiple years
            </p>
          </div>
          <WakaTimeMonthlyTrendView monthlyData={monthlyTrend} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Weekly Patterns</h2>
            <p className="text-sm text-muted-foreground">
              Coding activity breakdown by day of week
            </p>
          </div>
          <WakaTimeHourlyHeatmapView heatmapData={heatmap} />
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

        <p className="text-xs text-muted-foreground">Data Source: WakaTime</p>
      </div>
    </div>
  );
}
