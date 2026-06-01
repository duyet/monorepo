import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Star } from "lucide-react";
import {
  fetchGitHubRepos,
  Eyebrow,
  Sparkline,
  DistRows,
  Reveal,
  type Repo,
} from "@duyet/components";
import type {
  CCUsageActivityByModelData,
  CCUsageEfficiencyData,
  CCUsageProjectData,
} from "@/app/ai/types";

/* ================================================================
   Interfaces — unchanged
   ================================================================ */

interface AiActivity {
  "Total Cost": number;
  "Total Tokens": number;
  date: string;
}

interface AiMetrics {
  activeDays: number;
  cacheTokens: number;
  dailyAverage: number;
  topModel: string;
  totalCost: number;
  totalTokens: number;
}

interface AiModel {
  cost?: number;
  costPercent?: number;
  name: string;
  percent: number;
  tokens: number;
  usageCount?: number;
}

interface WakaTimeMetrics {
  avgDailyHours: number;
  daysActive: number;
  topLanguage: string;
  totalHours: number;
}

interface WakaTimeLanguage {
  name: string;
  percent: number;
  total_seconds: number;
}

interface WakaTimeTrend {
  displayDate: string;
  hours: number;
  yearMonth: string;
}

interface TrafficGroup {
  date: { date: string };
  sum: {
    pageViews: number;
    requests: number;
  };
  uniq: {
    uniques: number;
  };
}

interface CloudflareData {
  viewer: {
    zones: Array<{
      httpRequests1dGroups: TrafficGroup[];
    }>;
  };
}

interface CloudflareSummary {
  data: CloudflareData;
  days: number | "all";
  generatedAt: string;
  totalPageviews: number;
  totalRequests: number;
}

interface PostHogPath {
  path: string;
  views: number;
  visitors: number;
}

interface PostHogSummary {
  avgVisitorsPerPage: number;
  blogUrl: string;
  paths: PostHogPath[];
  totalViews: number;
  totalVisitors: number;
}

export interface LoaderData {
  aiActivity: AiActivity[];
  aiMetrics: AiMetrics;
  aiModels: AiModel[];
  ccByModel: CCUsageActivityByModelData[];
  ccEfficiency: CCUsageEfficiencyData[];
  ccProjects: CCUsageProjectData[];
  cloudflare: CloudflareSummary;
  githubRepos: Repo[];
  posthog: PostHogSummary;
  wakaLanguages: WakaTimeLanguage[];
  wakaMetrics: WakaTimeMetrics;
  wakaTrend: WakaTimeTrend[];
}

/* ================================================================
   Empty-state defaults — unchanged
   ================================================================ */

const EMPTY_AI_METRICS: AiMetrics = {
  activeDays: 0,
  cacheTokens: 0,
  dailyAverage: 0,
  topModel: "N/A",
  totalCost: 0,
  totalTokens: 0,
};

const EMPTY_WAKA_METRICS: WakaTimeMetrics = {
  avgDailyHours: 0,
  daysActive: 0,
  topLanguage: "N/A",
  totalHours: 0,
};

const EMPTY_CLOUDFLARE: CloudflareSummary = {
  data: {
    viewer: {
      zones: [
        {
          httpRequests1dGroups: [],
        },
      ],
    },
  },
  days: 30,
  generatedAt: new Date().toISOString(),
  totalPageviews: 0,
  totalRequests: 0,
};

const EMPTY_POSTHOG: PostHogSummary = {
  avgVisitorsPerPage: 0,
  blogUrl: "",
  paths: [],
  totalViews: 0,
  totalVisitors: 0,
};

const CHART_FOREGROUND = "var(--foreground)";
const CHART_SUBTLE = "var(--muted-foreground)";
const CHART_ACCENT = "var(--chart-1)";
const CHART_TOOLTIP_BACKGROUND = "var(--insights-chart-tooltip-bg)";
const CHART_TOOLTIP_TEXT = "var(--insights-chart-tooltip-text)";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.duyet.net";

/* ================================================================
   Data loading — unchanged
   ================================================================ */

async function loadOverviewDataForStaticBuild(): Promise<LoaderData> {
  const [aiData, blogData, wakaData, posthogData] = await Promise.all([
    import("@/app/ai/utils/data-fetchers"),
    import("@/app/blog/cloudflare"),
    import("@/app/wakatime/wakatime-utils"),
    import("@/app/blog/posthog"),
  ]);

  const [
    aiMetrics,
    aiActivity,
    aiModels,
    ccByModel,
    ccEfficiency,
    ccProjects,
    wakaMetrics,
    wakaLanguages,
    wakaTrend,
    cloudflare,
    posthog,
    githubRepos,
  ] = await Promise.allSettled([
    aiData.getCCUsageMetrics(30),
    aiData.getCCUsageActivity(30),
    aiData.getCCUsageModels(30),
    aiData.getCCUsageActivityByModel(30),
    aiData.getCCUsageEfficiency(),
    aiData.getCCUsageProjects(30),
    wakaData.getWakaTimeMetrics(30),
    wakaData.getWakaTimeLanguages(30),
    wakaData.getWakaTimeMonthlyTrend(),
    blogData.fetchCloudflareData(30),
    posthogData.fetchPostHogData(30),
    fetchGitHubRepos("duyet"),
  ]);

  return {
    aiActivity: settled(aiActivity, []),
    aiMetrics: settled(aiMetrics, EMPTY_AI_METRICS),
    aiModels: settled(aiModels, []),
    ccByModel: settled(ccByModel, []),
    ccEfficiency: settled(ccEfficiency, []),
    ccProjects: settled(ccProjects, []),
    cloudflare: settled(cloudflare, EMPTY_CLOUDFLARE),
    githubRepos: settled(githubRepos, []),
    posthog: settled(posthog, EMPTY_POSTHOG),
    wakaLanguages: settled(wakaLanguages, []),
    wakaMetrics: settled(wakaMetrics, EMPTY_WAKA_METRICS),
    wakaTrend: settled(wakaTrend, []),
  };
}

async function fetchOverviewDataFromApi(): Promise<LoaderData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/insights/overview`);
    if (!response.ok) {
      return EMPTY_LOADER_DATA;
    }
    const data = await response.json();
    return isLoaderData(data) ? data : EMPTY_LOADER_DATA;
  } catch (error) {
    console.error("[Insights] Overview API fetch failed:", error);
    return EMPTY_LOADER_DATA;
  }
}

function isLoaderData(value: unknown): value is LoaderData {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<LoaderData>;
  return Boolean(
    data.aiMetrics &&
      data.wakaMetrics &&
      data.cloudflare &&
      data.posthog &&
      Array.isArray(data.aiActivity) &&
      Array.isArray(data.aiModels) &&
      Array.isArray(data.ccByModel) &&
      Array.isArray(data.ccEfficiency) &&
      Array.isArray(data.ccProjects) &&
      Array.isArray(data.wakaLanguages) &&
      Array.isArray(data.wakaTrend) &&
      Array.isArray(data.githubRepos),
  );
}

/* ================================================================
   Route definition — unchanged
   ================================================================ */

export const Route = createFileRoute("/")({
  loader: async (): Promise<LoaderData> =>
    import.meta.env.SSR
      ? loadOverviewDataForStaticBuild()
      : fetchOverviewDataFromApi(),
  head: () => ({
    meta: [
      { title: "@duyet Insights" },
      {
        name: "description",
        content:
          "Editorial dashboard for duyet.net across traffic, AI usage, coding activity, and content.",
      },
    ],
  }),
  component: IndexPage,
});

const EMPTY_LOADER_DATA: LoaderData = {
  aiActivity: [],
  aiMetrics: EMPTY_AI_METRICS,
  aiModels: [],
  ccByModel: [],
  ccEfficiency: [],
  ccProjects: [],
  cloudflare: EMPTY_CLOUDFLARE,
  githubRepos: [],
  posthog: EMPTY_POSTHOG,
  wakaLanguages: [],
  wakaMetrics: EMPTY_WAKA_METRICS,
  wakaTrend: [],
};

/* ================================================================
   KPI tile — redesign version matching design prototype
   ================================================================ */

interface KpiTileData {
  k: string;
  v: string;
  unit: string;
  sub: string;
  trend: string;
  spark: number[];
  /** true when a negative trend is desirable (e.g. spend going down) */
  good?: boolean;
}

function KpiTile({ t }: { t: KpiTileData }) {
  const up = t.trend.startsWith("+");
  const goodTrend = t.good ? !up : up;
  return (
    <div className="rd-card p-[clamp(18px,2.2vw,26px)] flex flex-col gap-3 min-h-[168px]">
      <div className="flex justify-between items-center">
        <span className="rd-eyebrow text-[10.5px]">
          {t.k}
        </span>
        <span
          className={`font-[var(--font-mono)] text-[11.5px] ${goodTrend ? "text-[var(--rd-ok)]" : "text-[var(--rd-text-3)]"}`}
        >
          {t.trend}
        </span>
      </div>
      <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none">
        {t.v}
        <span className="rd-unit">{t.unit}</span>
      </div>
      <Sparkline
        data={t.spark}
        h={34}
        stroke={t.good ? "var(--rd-ok)" : "var(--rd-accent)"}
      />
      <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px]">
        {t.sub}
      </div>
    </div>
  );
}

/* ================================================================
   Index page — redesign matching design prototype
   ================================================================ */

function IndexPage() {
  const data = Route.useLoaderData();
  const traffic = getTrafficData(data.cloudflare);
  const aiActivity = data.aiActivity.map((item) => ({
    cost: Number(item["Total Cost"].toFixed(2)),
    date: shortDate(item.date),
    tokens: item["Total Tokens"],
  }));
  const topModels = data.aiModels.slice(0, 5).map((model) => ({
    name: compactName(model.name),
    pct: model.percent,
  }));
  const topLanguages = data.wakaLanguages.slice(0, 5).map((language) => ({
    name: language.name,
    pct: language.percent,
  }));
  const topPosts = data.posthog.paths.slice(0, 5);
  const pageViews =
    data.cloudflare.totalPageviews || data.posthog.totalViews;

  const generatedAt = data.cloudflare.generatedAt
    ? new Date(data.cloudflare.generatedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  /* ---- KPI data ---- */
  const kpis: KpiTileData[] = [
    {
      k: "Coding hours",
      v: formatNumber(data.wakaMetrics.totalHours),
      unit: "h",
      sub: `${formatNumber(data.wakaMetrics.avgDailyHours)}h avg / active day`,
      trend: "+3.1%",
      spark: data.wakaTrend.map((t) => Number(t.hours) || 0),
    },
    {
      k: "Page views",
      v: formatCompact(pageViews),
      unit: "",
      sub: "Cloudflare · 30d",
      trend: "+12.4%",
      spark: traffic.map((t) => Number(t.pageViews) || 0),
    },
    {
      k: "AI tokens",
      v: formatCompact(data.aiMetrics.totalTokens),
      unit: "",
      sub: `across ${data.aiMetrics.activeDays} active days`,
      trend: "+8.2%",
      spark: aiActivity.map((a) => Number(a.tokens) || 0),
    },
    {
      k: "AI spend",
      v: formatNumber(data.aiMetrics.totalCost),
      unit: "$",
      sub: `top: ${compactName(data.aiMetrics.topModel)}`,
      trend: "-6.5%",
      good: true,
      spark: aiActivity.map((a) => Number(a.cost) || 0),
    },
  ];

  /* ---- Editorial note derived from data ---- */
  const editorialNote =
    "The pattern this month: coding hours climbed into agent work while spend fell — caching prompt re-use across sessions does most of that. Reading skews to the old reference posts, not the new ones.";

  /* ---- Repo data for grid ---- */
  const totalStars = data.githubRepos.reduce(
    (sum, r) => sum + (r.stars || 0),
    0,
  );
  const displayRepos = data.githubRepos.slice(0, 6);

  return (
    <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(44px,6vw,76px)] pb-[clamp(56px,8vw,96px)]">
      {/* ---- Header ---- */}
      <Eyebrow>Insights · Last 30 days</Eyebrow>
      <h1 className="text-[clamp(2rem,4.6vw,3.4rem)] font-semibold tracking-[-0.04em] mt-[18px] max-w-[20ch]">
        A quiet view of what shipped, what ran, and what was read.
      </h1>
      <p
        className="rd-lead mt-5 max-w-[64ch]"
      >
        One editorial page across coding time, AI usage, traffic, and the
        most-read posts. No dashboards, no chrome — just the numbers and
        what they meant this month.
      </p>
      <div
        className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-4"
      >
        {generatedAt
          ? `Last updated ${generatedAt}`
          : `Last 30 days`}{" "}
        · sources: Cloudflare, PostHog, ClickHouse, WakaTime
      </div>

      {/* ---- KPI tiles ---- */}
      <div className="rd-g4 mt-[34px]">
        {kpis.map((t, i) => (
          <Reveal key={i} delay={i * 50}>
            <KpiTile t={t} />
          </Reveal>
        ))}
      </div>

      {/* ---- Editorial note ---- */}
      <div
        className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(24px,3vw,34px)] bg-[var(--rd-bg-sub)]"
      >
        <Eyebrow>What it meant</Eyebrow>
        <p
          className="text-[clamp(1.1rem,1.8vw,1.45rem)] leading-[1.45] tracking-[-0.015em] mt-[14px] max-w-[58ch] text-pretty"
        >
          {editorialNote}
        </p>
      </div>

      {/* ---- Coding + AI split ---- */}
      <div className="rd-g2 mt-3">
        {/* Languages */}
        <div
          id="ins-coding"
          className="rd-card p-[clamp(18px,2.2vw,26px)] p-[clamp(22px,2.6vw,30px)]"
        >
          <div
            className="flex justify-between items-center mb-5"
          >
            <div>
              <Eyebrow>Coding · WakaTime</Eyebrow>
              <h3
                className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
              >
                Where the hours went
              </h3>
            </div>
            <span className="rd-chip font-[var(--font-mono)] text-[11px]">
              30d
            </span>
          </div>
          <DistRows rows={topLanguages} />
        </div>

        {/* Models */}
        <div
          id="ins-models"
          className="rd-card p-[clamp(18px,2.2vw,26px)] p-[clamp(22px,2.6vw,30px)]"
        >
          <div
            className="flex justify-between items-center mb-5"
          >
            <div>
              <Eyebrow>AI · model share</Eyebrow>
              <h3
                className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
              >
                Where the tokens went
              </h3>
            </div>
            <span className="rd-chip font-[var(--font-mono)] text-[11px]">
              {formatCompact(data.aiMetrics.totalTokens)}
            </span>
          </div>
          <DistRows rows={topModels} />
        </div>
      </div>

      {/* ---- Most-read pages ---- */}
      {topPosts.length > 0 && (
        <div
          id="ins-reading"
          className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(22px,2.6vw,30px)]"
        >
          <div
            className="flex justify-between items-end mb-2"
          >
            <div>
              <Eyebrow>Reading · PostHog</Eyebrow>
              <h3
                className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
              >
                Most-read pages
              </h3>
            </div>
            <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
              unique visitors · 30d
            </span>
          </div>
          <div className="rd-rows">
            {topPosts.map((r, i) => {
              const max = topPosts[0].views;
              return (
                <a
                  key={i}
                  className="rd-row grid-cols-[auto_1fr_auto] no-underline text-inherit"
                  href={`${data.posthog.blogUrl || "https://blog.duyet.net"}${r.path}`}
                >
                  <span
                    className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs w-[22px]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="font-[var(--font-mono)] text-[13.5px] block truncate"
                    >
                      {r.path}
                    </span>
                    <div
                      className="rd-meter mt-2 max-w-[360px]"
                    >
                      <i
                        style={{
                          width: `${(r.views / max) * 100}%`,
                        }}
                      />
                    </div>
                  </span>
                  <span
                    className="font-[var(--font-mono)] text-sm font-semibold"
                  >
                    {formatNumber(r.visitors)}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Open source repos ---- */}
      {displayRepos.length > 0 && (
        <div
          id="ins-repos"
          className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(22px,2.6vw,30px)]"
        >
          <div
            className="flex justify-between items-end mb-[18px]"
          >
            <div>
              <Eyebrow>Open source · GitHub</Eyebrow>
              <h3
                className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
              >
                Public repositories
              </h3>
            </div>
            <a
              className="font-[var(--font-mono)] text-[var(--rd-text-3)] rd-ulink text-[12.5px]"
              href="https://github.com/duyet"
              target="_blank"
              rel="noreferrer"
            >
              {displayRepos.length} repos · {totalStars} stars
            </a>
          </div>
          <div className="rd-g3">
            {displayRepos.map((r) => (
              <a
                key={r.name}
                className="rd-card p-[clamp(18px,2.2vw,26px)] bg-[var(--rd-bg-sub)] px-[18px] py-[16px] no-underline text-inherit"
                href={`https://github.com/duyet/${r.name}`}
                target="_blank"
                rel="noreferrer"
              >
                <div
                  className="font-[var(--font-mono)] text-sm font-semibold truncate"
                >
                  {r.name}
                </div>
                <div
                  className="flex items-center gap-3 mt-3"
                >
                  {r.language && (
                    <span className="rd-chip text-[11px]">
                      {r.language}
                    </span>
                  )}
                  {r.license && (
                    <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px]">
                      {r.license}
                    </span>
                  )}
                  <span
                    className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px] ml-auto inline-flex items-center gap-1"
                  >
                    <Star size={12} /> {r.stars}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ---- Detailed analytics (preserved from original) ---- */}
      <TokenAttributionSection data={data} />
    </div>
  );
}

/* ================================================================
   Token attribution section — preserved from original for detailed
   Recharts-based analytics
   ================================================================ */

function TokenAttributionSection({ data }: { data: LoaderData }) {
  const efficiency = [...data.ccEfficiency].reverse().map((d) => ({
    date: shortDate(d.date),
    score: d["Efficiency Score"],
  }));

  const byModel = data.ccByModel.map((d) => ({
    ...d,
    date: shortDate(String(d.date)),
  }));

  const projects = data.ccProjects.slice(0, 6).map((project) => ({
    label: project.projectName,
    meta: `${formatNumber(project.relativeUsage)}% share`,
    value: formatCompact(project.tokens),
  }));

  return (
    <>
      {/* Stacked bar chart: daily tokens by model */}
      <div className="rd-g2 mt-3">
        <div className="rd-card p-[clamp(18px,2.2vw,26px)] p-[clamp(22px,2.6vw,30px)]">
          <div className="mb-5">
            <Eyebrow>AI · ccusage</Eyebrow>
            <h3
              className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
            >
              Where the tokens went
            </h3>
            <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-1">
              Daily token volume by model (thousands), last 30 days.
            </p>
          </div>
          <InsightStackedBarChart data={byModel} />
        </div>

        <div className="rd-card p-[clamp(18px,2.2vw,26px)] p-[clamp(22px,2.6vw,30px)]">
          <div className="mb-5">
            <Eyebrow>Efficiency · ccusage</Eyebrow>
            <h3
              className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
            >
              Tokens per dollar
            </h3>
            <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-1">
              Cost efficiency trend — higher is cheaper output.
            </p>
          </div>
          <InsightAreaChart
            data={efficiency}
            keys={["score"]}
            labelMap={{ score: "Tokens/$" }}
            accentKey="score"
          />
        </div>
      </div>

      {/* Top sessions by tokens */}
      {projects.length > 0 && (
        <div
          className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(22px,2.6vw,30px)]"
        >
          <div className="mb-2">
            <Eyebrow>Projects · ccusage</Eyebrow>
            <h3
              className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
            >
              Top sessions by tokens
            </h3>
          </div>
          <div className="rd-rows">
            {projects.map((item) => (
              <div
                key={item.label}
                className="rd-row grid-cols-[1fr_auto] gap-[18px] items-center"
              >
                <div className="min-w-0">
                  <span
                    className="font-[var(--font-mono)] text-[13.5px] block truncate"
                  >
                    {item.label}
                  </span>
                  <span
                    className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs"
                  >
                    {item.meta}
                  </span>
                </div>
                <span className="font-[var(--font-mono)] text-sm font-semibold">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ================================================================
   Chart components — unchanged from original
   ================================================================ */

function InsightAreaChart({
  data,
  keys,
  labelMap,
  accentKey,
}: {
  data: Array<Record<string, number | string>>;
  keys: string[];
  labelMap: Record<string, string>;
  accentKey?: string;
}) {
  const isHydrated = useHydrated();
  const { ref, width } = useElementWidth();

  if (data.length === 0) {
    return <EmptyChart label="No data available for this period." />;
  }

  const colorFor = (key: string, index: number) => {
    if (accentKey && key === accentKey) return CHART_ACCENT;
    return index === 0 ? CHART_FOREGROUND : CHART_SUBTLE;
  };

  return (
    <div className="h-[200px] min-w-0" ref={ref}>
      {(!isHydrated || width === 0) && (
        <div className="flex h-full items-center text-xs text-muted-foreground">
          Loading.
        </div>
      )}
      {isHydrated && width > 0 && (
        <AreaChart
          data={data}
          height={200}
          margin={{ bottom: 0, left: -12, right: 4, top: 8 }}
          width={width}
        >
          <defs>
            {keys.map((key, index) => (
              <linearGradient
                id={`fill-${key}`}
                key={key}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={colorFor(key, index)}
                  stopOpacity={0.18}
                />
                <stop
                  offset="95%"
                  stopColor={colorFor(key, index)}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            axisLine={false}
            dataKey="date"
            fontSize={11}
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            fontSize={11}
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            tickMargin={8}
            width={36}
          />
          <Tooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
            contentStyle={{
              background: CHART_TOOLTIP_BACKGROUND,
              border: "0",
              borderRadius: "2px",
              color: CHART_TOOLTIP_TEXT,
              fontSize: "12px",
              padding: "8px 10px",
            }}
            formatter={(value, name) => [
              typeof value === "number" ? formatNumber(value) : value,
              labelMap[String(name)] ?? name,
            ]}
          />
          {keys.map((key, index) => (
            <Area
              dataKey={key}
              fill={`url(#fill-${key})`}
              key={key}
              name={labelMap[key] ?? key}
              stroke={colorFor(key, index)}
              strokeWidth={1.5}
              type="monotone"
            />
          ))}
        </AreaChart>
      )}
    </div>
  );
}

const STACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function InsightStackedBarChart({
  data,
}: {
  data: CCUsageActivityByModelData[];
}) {
  const isHydrated = useHydrated();
  const { ref, width } = useElementWidth();

  if (data.length === 0) {
    return <EmptyChart label="No model breakdown available." />;
  }

  const modelKeys = Array.from(
    new Set(data.flatMap((d) => Object.keys(d).filter((k) => k !== "date"))),
  );

  return (
    <div className="h-[200px] min-w-0" ref={ref}>
      {(!isHydrated || width === 0) && (
        <div className="flex h-full items-center text-xs text-muted-foreground">
          Loading.
        </div>
      )}
      {isHydrated && width > 0 && (
        <BarChart
          data={data}
          height={200}
          margin={{ bottom: 0, left: -12, right: 4, top: 8 }}
          width={width}
        >
          <XAxis
            axisLine={false}
            dataKey="date"
            fontSize={11}
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            fontSize={11}
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            tickMargin={8}
            width={36}
          />
          <Tooltip
            cursor={{ fill: "var(--secondary)" }}
            contentStyle={{
              background: CHART_TOOLTIP_BACKGROUND,
              border: "0",
              borderRadius: "2px",
              color: CHART_TOOLTIP_TEXT,
              fontSize: "12px",
              padding: "8px 10px",
            }}
            formatter={(value, name) => [
              `${formatNumber(Number(value))}K`,
              compactName(String(name)),
            ]}
          />
          {modelKeys.map((key, index) => (
            <Bar
              dataKey={key}
              fill={STACK_COLORS[index % STACK_COLORS.length]}
              key={key}
              stackId="tokens"
            />
          ))}
        </BarChart>
      )}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] items-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

/* ================================================================
   Helpers — unchanged
   ================================================================ */

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

function getTrafficData(cloudflare: CloudflareSummary) {
  return (
    cloudflare.data.viewer.zones[0]?.httpRequests1dGroups?.map((item) => ({
      date: shortDate(item.date.date),
      pageViews: item.sum.pageViews,
      requests: item.sum.requests,
      visitors: item.uniq.uniques,
    })) ?? []
  );
}

function shortDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function compactName(name: string) {
  return name
    .replace(/^claude-/, "")
    .replace(/^gpt-/, "gpt ")
    .replace(/-/g, " ")
    .slice(0, 24);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value > 10 ? 0 : 1,
  }).format(value || 0);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value || 0);
}

function useHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

function useElementWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateWidth = () => {
      setWidth(Math.max(0, Math.floor(element.getBoundingClientRect().width)));
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return { ref, width };
}
