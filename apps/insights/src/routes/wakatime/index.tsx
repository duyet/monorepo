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
import {
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";

const STATIC_DAYS: PeriodDays = getPeriodDays(DEFAULT_PERIOD) as PeriodDays;
const WAKATIME_BADGE_URL = "/wakatime-assets/badge.svg";
const WAKATIME_HEATMAP_URLS = {
  light: "/wakatime-assets/heatmap-light.svg",
  dark: "/wakatime-assets/heatmap-dark.svg",
};

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
    <div className="space-y-6">
      <InsightsPageHeader
        badge="WakaTime"
        title="Coding analytics"
        description="Programming activity, language trends, and coding behavior from WakaTime."
      />

      <div className="space-y-6">
        <InsightsSection
          title="Coding overview"
          description="Programming activity summary for the last 30 days."
        >
          <WakaTimeMetricsView metrics={metrics} />
        </InsightsSection>

        <InsightsSection
          title="Daily activity"
          description="Coding hours over the last 30 days."
        >
          <WakaTimeActivityView codingActivity={activity} />
        </InsightsSection>

        <InsightsSection
          title="Programming languages"
          description="Language usage and distribution."
        >
          <WakaTimeLanguagesView languages={languages} />
        </InsightsSection>

        <InsightsSection
          title="Long-term trends"
          description="Historical coding activity over multiple years."
        >
          <WakaTimeMonthlyTrendView monthlyData={monthlyTrend} />
        </InsightsSection>

        <InsightsSection
          title="Weekly patterns"
          description="Coding activity breakdown by day of week."
        >
          <WakaTimeHourlyHeatmapView heatmapData={heatmap} />
        </InsightsSection>

        <InsightsSection
          title="Yearly activity"
          description="Annual coding activity heatmap."
        >
          <StaticCard
            extra={
              <img
                alt="Wakatime Badge"
                className="mt-3"
                height={30}
                src={WAKATIME_BADGE_URL}
                width={200}
              />
            }
            source="WakaTime (Last Year)"
            title="Coding Activity Heatmap"
            url={WAKATIME_HEATMAP_URLS}
          />
        </InsightsSection>

        <p className="text-xs text-muted-foreground">Data Source: WakaTime</p>
      </div>
    </div>
  );
}
