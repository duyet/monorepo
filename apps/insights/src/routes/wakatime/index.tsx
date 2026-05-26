import { createFileRoute } from "@tanstack/react-router";
import { WakaTimeActivityView } from "@/app/wakatime/activity";
import { WakaTimeBreakdownList } from "@/app/wakatime/breakdown";
import { WakaTimeHourlyHeatmapView } from "@/app/wakatime/hourly-heatmap";
import { WakaTimeLanguagesView } from "@/app/wakatime/languages";
import { WakaTimeMetricsView } from "@/app/wakatime/metrics";
import { WakaTimeMonthlyTrendView } from "@/app/wakatime/monthly-trend";
import {
  getBestDayWakaTime,
  getWakaTimeActivityWithAI,
  getWakaTimeCategories,
  getWakaTimeEditors,
  getWakaTimeHourlyHeatmap,
  getWakaTimeLanguages,
  getWakaTimeMachines,
  getWakaTimeMetrics,
  getWakaTimeMonthlyTrend,
  getWakaTimeOperatingSystems,
  getWakaTimeProjects,
} from "@/app/wakatime/wakatime-utils";
import { StaticCard } from "@/components/StaticCard";
import type { PeriodDays } from "@/lib/periods";
import { DEFAULT_PERIOD, getPeriodDays } from "@/lib/periods";
import {
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";
import { Badge } from "@duyet/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@duyet/components/ui/card";

const STATIC_DAYS: PeriodDays = getPeriodDays(DEFAULT_PERIOD) as PeriodDays;
const WAKATIME_BADGE_URL = "/wakatime-assets/badge.svg";
const WAKATIME_HEATMAP_URLS = {
  light: "/wakatime-assets/heatmap-light.svg",
  dark: "/wakatime-assets/heatmap-dark.svg",
};

export const Route = createFileRoute("/wakatime/")({
  loader: async () => {
    const days = STATIC_DAYS;
    const [
      metrics,
      activity,
      languages,
      editors,
      operatingSystems,
      monthlyTrend,
      heatmap,
      bestDay,
      categories,
      machines,
      projects,
    ] = await Promise.allSettled([
      getWakaTimeMetrics(days),
      getWakaTimeActivityWithAI(days),
      getWakaTimeLanguages(days),
      getWakaTimeEditors(days),
      getWakaTimeOperatingSystems(days),
      getWakaTimeMonthlyTrend(),
      getWakaTimeHourlyHeatmap(),
      getBestDayWakaTime(),
      getWakaTimeCategories(days),
      getWakaTimeMachines(days),
      getWakaTimeProjects(days),
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
      editors: editors.status === "fulfilled" ? editors.value : [],
      operatingSystems:
        operatingSystems.status === "fulfilled" ? operatingSystems.value : [],
      monthlyTrend:
        monthlyTrend.status === "fulfilled" ? monthlyTrend.value : [],
      heatmap: heatmap.status === "fulfilled" ? heatmap.value : [],
      bestDay: bestDay.status === "fulfilled" ? bestDay.value : null,
      categories: categories.status === "fulfilled" ? categories.value : [],
      machines: machines.status === "fulfilled" ? machines.value : [],
      projects: projects.status === "fulfilled" ? projects.value : [],
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
  const {
    metrics,
    activity,
    languages,
    editors,
    operatingSystems,
    monthlyTrend,
    heatmap,
    bestDay,
    categories,
    machines,
    projects,
  } = Route.useLoaderData();

  return (
    <div>
      <InsightsPageHeader
        badge="WakaTime"
        title="Where the hours at the keyboard went."
        description="Programming activity, language trends, and coding behavior from WakaTime."
      />

      <div>
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
          title="Editors"
          description="Where the typing happened — top editors by share of coding time."
        >
          <WakaTimeBreakdownList items={editors} />
        </InsightsSection>

        <InsightsSection
          title="Operating systems"
          description="Which OS the keyboard hours landed on."
        >
          <WakaTimeBreakdownList items={operatingSystems} />
        </InsightsSection>

        {bestDay && (
          <InsightsSection
            title="Personal best"
            description="Best single coding day on record."
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best day
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Badge variant="outline">{bestDay.date}</Badge>
                <span className="text-2xl font-semibold tabular-nums">
                  {bestDay.total.text}
                </span>
              </CardContent>
            </Card>
          </InsightsSection>
        )}

        {categories.length > 0 && (
          <InsightsSection
            title="Categories"
            description="Coding, debugging, building — time by activity type."
          >
            <WakaTimeBreakdownList items={categories} />
          </InsightsSection>
        )}

        {machines.length > 0 && (
          <InsightsSection
            title="Machines"
            description="Which machines the coding hours landed on."
          >
            <WakaTimeBreakdownList items={machines} />
          </InsightsSection>
        )}

        {projects.length > 0 && (
          <InsightsSection
            title="Top projects"
            description="Most active projects by coding time."
          >
            <WakaTimeBreakdownList items={projects} />
          </InsightsSection>
        )}

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

        <p className="border-t pt-6 text-xs italic text-muted-foreground">
          Source: WakaTime.
        </p>
      </div>
    </div>
  );
}
