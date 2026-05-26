import { createFileRoute } from "@tanstack/react-router";
import { WakaTimeActivityView } from "@/app/wakatime/activity";
import { WakaTimeLanguagesView } from "@/app/wakatime/languages";
import { WakaTimeMetricsView } from "@/app/wakatime/metrics";
import {
  getBestDayWakaTime,
  getWakaTimeActivityWithAI,
  getWakaTimeCategories,
  getWakaTimeEditors,
  getWakaTimeLanguages,
  getWakaTimeMachines,
  getWakaTimeMetrics,
  getWakaTimeMonthlyActivity,
  getWakaTimeOperatingSystems,
  getWakaTimeProjects,
} from "@/app/wakatime/wakatime-utils";
import { WakaTimeBreakdownList } from "@/app/wakatime/breakdown";
import { StaticCard } from "@/components/StaticCard";
import type { PeriodDays } from "@/lib/periods";
import { getPeriodConfig, getPeriodDays } from "@/lib/periods";
import { PeriodSwitcher } from "@/components/PeriodSwitcher";
import {
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";
import { Badge } from "@duyet/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@duyet/components/ui/card";

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

    const [
      metrics,
      activity,
      languages,
      editors,
      operatingSystems,
      bestDay,
      categories,
      machines,
      projects,
    ] = await Promise.allSettled([
      getWakaTimeMetrics(days),
      isAllTime
        ? getWakaTimeMonthlyActivity()
        : getWakaTimeActivityWithAI(days),
      getWakaTimeLanguages(days),
      getWakaTimeEditors(days),
      getWakaTimeOperatingSystems(days),
      getBestDayWakaTime(),
      getWakaTimeCategories(days),
      getWakaTimeMachines(days),
      getWakaTimeProjects(days),
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
      editors: editors.status === "fulfilled" ? editors.value : [],
      operatingSystems:
        operatingSystems.status === "fulfilled" ? operatingSystems.value : [],
      bestDay: bestDay.status === "fulfilled" ? bestDay.value : null,
      categories: categories.status === "fulfilled" ? categories.value : [],
      machines: machines.status === "fulfilled" ? machines.value : [],
      projects: projects.status === "fulfilled" ? projects.value : [],
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
  const {
    config,
    isAllTime,
    metrics,
    activity,
    languages,
    editors,
    operatingSystems,
    bestDay,
    categories,
    machines,
    projects,
  } = Route.useLoaderData();

  const activityTitle = isAllTime ? "Monthly Activity" : "Daily Activity";
  const activityDescription = isAllTime
    ? "Coding all the time"
    : `Coding hours over the last ${config.label}`;
  const overviewDescription = isAllTime
    ? "All-time programming activity summary"
    : `Programming activity summary for the last ${config.label}`;

  return (
    <div>
      <InsightsPageHeader
        badge={`WakaTime · ${config.label}`}
        title="Where the hours at the keyboard went."
        description="Programming activity and language statistics for the selected period."
      />

      <div className="mb-12">
        <PeriodSwitcher
          current={config.value}
          route="/wakatime/$period"
          eyebrow="Period"
        />
      </div>

      <div>
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

        {editors.length > 0 && (
          <InsightsSection
            title="Editors"
            description="Where the typing happened — top editors by share of coding time."
          >
            <WakaTimeBreakdownList items={editors} />
          </InsightsSection>
        )}

        {operatingSystems.length > 0 && (
          <InsightsSection
            title="Operating systems"
            description="Which OS the keyboard hours landed on."
          >
            <WakaTimeBreakdownList items={operatingSystems} />
          </InsightsSection>
        )}

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
          Data from WakaTime · updated daily.
        </p>
      </div>
    </div>
  );
}
