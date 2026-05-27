import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Folder, Monitor, Terminal } from "lucide-react";
import { WakaTimeActivityView } from "@/app/wakatime/activity";
import { WakaTimeBestDayCard } from "@/app/wakatime/best-day";
import { WakaTimeBreakdownView } from "@/app/wakatime/breakdown";
import { WakaTimeLanguagesView } from "@/app/wakatime/languages";
import { WakaTimeMetricsView } from "@/app/wakatime/metrics";
import {
  EMPTY_WAKATIME_OVERVIEW,
  getWakaTimeActivityWithAI,
  getWakaTimeLanguages,
  getWakaTimeMonthlyActivity,
  getWakaTimeOverview,
} from "@/app/wakatime/wakatime-utils";
import { PeriodSwitcher } from "@/components/PeriodSwitcher";
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

    const [overview, activity, languages] = await Promise.allSettled([
      getWakaTimeOverview(days),
      isAllTime
        ? getWakaTimeMonthlyActivity()
        : getWakaTimeActivityWithAI(days),
      getWakaTimeLanguages(days),
    ]);

    return {
      config,
      days,
      isAllTime,
      overview:
        overview.status === "fulfilled"
          ? overview.value
          : EMPTY_WAKATIME_OVERVIEW,
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
  const { config, isAllTime, overview, activity, languages } =
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

  const activityTitle = isAllTime ? "Monthly Activity" : "Daily Activity";
  const activityDescription = isAllTime
    ? "Coding all the time"
    : `Coding hours over the last ${config.label}`;
  const overviewDescription = isAllTime
    ? "All-time programming activity summary"
    : `Programming activity summary for the last ${config.label}`;

  const hasEnvironment =
    editors.length > 0 ||
    operatingSystems.length > 0 ||
    categories.length > 0 ||
    machines.length > 0;

  return (
    <div>
      <InsightsPageHeader
        badge={`WakaTime · ${config.label}`}
        title="Where the hours at the keyboard went."
        description="Programming activity, languages, editors, operating systems, and project breakdown for the selected period."
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

        {bestDay ? (
          <InsightsSection
            title="Personal best"
            description="The day you logged the most coding time in this window."
          >
            <WakaTimeBestDayCard bestDay={bestDay} periodLabel={config.label} />
          </InsightsSection>
        ) : null}

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
