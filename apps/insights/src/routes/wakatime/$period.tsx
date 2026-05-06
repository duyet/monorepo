import { createFileRoute } from "@tanstack/react-router";
import { WakaTimeActivityView } from "@/app/wakatime/activity";
import { WakaTimeLanguagesView } from "@/app/wakatime/languages";
import { WakaTimeMetricsView } from "@/app/wakatime/metrics";
import {
  getWakaTimeActivityWithAI,
  getWakaTimeLanguages,
  getWakaTimeMetrics,
  getWakaTimeMonthlyActivity,
} from "@/app/wakatime/wakatime-utils";
import { StaticCard } from "@/components/StaticCard";
import type { PeriodDays } from "@/lib/periods";
import { getPeriodConfig, getPeriodDays } from "@/lib/periods";
import {
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";

const WAKATIME_BADGE_URL = "/wakatime-assets/badge.svg";
const WAKATIME_HEATMAP_URLS = {
  light: "/wakatime-assets/heatmap-light.svg",
  dark: "/wakatime-assets/heatmap-dark.svg",
};

export const Route = createFileRoute("/wakatime/$period")({
  loader: async ({ params }) => {
    const { period } = params;
    const config = getPeriodConfig(period);
    const days = getPeriodDays(period) as PeriodDays;
    const isAllTime = days === "all";

    const [metrics, activity, languages] = await Promise.allSettled([
      getWakaTimeMetrics(days),
      isAllTime
        ? getWakaTimeMonthlyActivity()
        : getWakaTimeActivityWithAI(days),
      getWakaTimeLanguages(days),
    ]);

    return {
      config,
      days,
      isAllTime,
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
  const { config, isAllTime, metrics, activity, languages } =
    Route.useLoaderData();

  const activityTitle = isAllTime ? "Monthly Activity" : "Daily Activity";
  const activityDescription = isAllTime
    ? "Coding all the time"
    : `Coding hours over the last ${config.label}`;
  const overviewDescription = isAllTime
    ? "All-time programming activity summary"
    : `Programming activity summary for the last ${config.label}`;

  return (
    <div className="space-y-6">
      <InsightsPageHeader
        badge={`WakaTime • ${config.label}`}
        title="Coding analytics"
        description="Programming activity and language statistics for the selected period."
      />

      <div className="space-y-6">
        <InsightsSection title="Coding overview" description={overviewDescription}>
          <WakaTimeMetricsView metrics={metrics} />
        </InsightsSection>

        <InsightsSection title={activityTitle} description={activityDescription}>
          <WakaTimeActivityView
            codingActivity={activity}
            isAllTime={isAllTime}
          />
        </InsightsSection>

        <InsightsSection
          title="Programming languages"
          description="Language usage and distribution."
        >
          <WakaTimeLanguagesView languages={languages} />
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

        <p className="text-xs text-muted-foreground">
          Data from WakaTime • Updated daily
        </p>
      </div>
    </div>
  );
}
