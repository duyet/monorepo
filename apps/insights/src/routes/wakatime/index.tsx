import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Folder, Monitor, Terminal } from "lucide-react";
import { WakaTimeActivityView } from "@/app/wakatime/activity";
import { WakaTimeBestDayCard } from "@/app/wakatime/best-day";
import { WakaTimeBreakdownView } from "@/app/wakatime/breakdown";
import { WakaTimeHourlyHeatmapView } from "@/app/wakatime/hourly-heatmap";
import { WakaTimeLanguagesView } from "@/app/wakatime/languages";
import { WakaTimeMetricsView } from "@/app/wakatime/metrics";
import { WakaTimeMonthlyTrendView } from "@/app/wakatime/monthly-trend";
import {
  getWakaTimeActivityWithAI,
  getWakaTimeHourlyHeatmap,
  getWakaTimeLanguages,
  getWakaTimeMonthlyTrend,
  getWakaTimeOverview,
  type WakaTimeOverview,
} from "@/app/wakatime/wakatime-utils";
import {
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";
import { StaticCard } from "@/components/StaticCard";
import type { PeriodDays } from "@/lib/periods";
import { DEFAULT_PERIOD, getPeriodDays } from "@/lib/periods";

const STATIC_DAYS: PeriodDays = getPeriodDays(DEFAULT_PERIOD) as PeriodDays;
const WAKATIME_BADGE_URL = "/wakatime-assets/badge.svg";
const WAKATIME_HEATMAP_URLS = {
  light: "/wakatime-assets/heatmap-light.svg",
  dark: "/wakatime-assets/heatmap-dark.svg",
};

const EMPTY_OVERVIEW: WakaTimeOverview = {
  metrics: {
    totalHours: 0,
    avgDailyHours: 0,
    daysActive: 0,
    topLanguage: "N/A",
  },
  editors: [],
  operatingSystems: [],
  categories: [],
  machines: [],
  projects: [],
  bestDay: null,
};

export const Route = createFileRoute("/wakatime/")({
  loader: async () => {
    const days = STATIC_DAYS;
    const [overview, activity, languages, monthlyTrend, heatmap] =
      await Promise.allSettled([
        getWakaTimeOverview(days),
        getWakaTimeActivityWithAI(days),
        getWakaTimeLanguages(days),
        getWakaTimeMonthlyTrend(),
        getWakaTimeHourlyHeatmap(),
      ]);

    return {
      days,
      overview:
        overview.status === "fulfilled" ? overview.value : EMPTY_OVERVIEW,
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
          "Programming activity, language statistics, editor & OS usage, projects, and coding insights from WakaTime",
      },
    ],
  }),
  component: WakatimePage,
});

function WakatimePage() {
  const { overview, activity, languages, monthlyTrend, heatmap } =
    Route.useLoaderData();
  const {
    metrics,
    editors,
    operatingSystems,
    categories,
    machines,
    projects,
    bestDay,
  } = overview;

  const hasEnvironment =
    editors.length > 0 ||
    operatingSystems.length > 0 ||
    categories.length > 0 ||
    machines.length > 0;

  return (
    <div>
      <InsightsPageHeader
        badge="WakaTime"
        title="Where the hours at the keyboard went."
        description="Programming activity, language trends, editors, operating systems, projects, and coding behavior from WakaTime."
      />

      <div>
        <InsightsSection
          title="Coding overview"
          description="Programming activity summary for the last 30 days."
        >
          <WakaTimeMetricsView metrics={metrics} />
        </InsightsSection>

        {bestDay ? (
          <InsightsSection
            title="Personal best"
            description="The day you logged the most coding time."
          >
            <WakaTimeBestDayCard bestDay={bestDay} periodLabel="Last 30 days" />
          </InsightsSection>
        ) : null}

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

        {hasEnvironment ? (
          <InsightsSection
            title="Tools & environment"
            description="Editors, operating systems, categories, and machines behind the keyboard."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <WakaTimeBreakdownView
                title="Editors"
                description="Where the code gets written."
                data={editors}
                icon={<Terminal className="h-4 w-4" />}
                emptyMessage="No editor data for this period."
              />
              <WakaTimeBreakdownView
                title="Operating systems"
                description="Platforms used while coding."
                data={operatingSystems}
                icon={<Monitor className="h-4 w-4" />}
                emptyMessage="No OS data for this period."
              />
              <WakaTimeBreakdownView
                title="Categories"
                description="What the keyboard time looked like (coding, debugging, building)."
                data={categories}
                icon={<Folder className="h-4 w-4" />}
                emptyMessage="No category data for this period."
              />
              <WakaTimeBreakdownView
                title="Machines"
                description="Devices logging coding activity."
                data={machines}
                icon={<Cpu className="h-4 w-4" />}
                emptyMessage="No machine data for this period."
              />
            </div>
          </InsightsSection>
        ) : null}

        {projects.length > 0 ? (
          <InsightsSection
            title="Top projects"
            description="Where the hours went, project by project."
          >
            <WakaTimeBreakdownView
              title="Projects"
              description="Top projects by coding hours in this window."
              data={projects}
              icon={<Folder className="h-4 w-4" />}
              emptyMessage="Project visibility may be private — no project breakdown available."
            />
          </InsightsSection>
        ) : null}

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

        <p className="border-t border-[color:var(--hairline)] pt-6 text-xs italic text-[color:var(--muted)]">
          Source: WakaTime.
        </p>
      </div>
    </div>
  );
}
