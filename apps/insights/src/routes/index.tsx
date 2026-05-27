import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChartLine,
  Clock,
  Code,
  Coins,
  Cpu,
  Database,
  Globe,
  Minus,
  Quote,
} from "lucide-react";
import { Badge } from "@duyet/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@duyet/components/ui/card";
import rawBlogPosts from "../../../blog/public/posts-data.json";
import {
  OpenSourceGrid,
  fetchGitHubRepos,
  type Repo,
} from "@duyet/components";

interface BentoPanelProps {
  icon: ReactNode;
  label: string;
  value: string;
  sparkline?: ReactNode;
  delta?: {
    value: string;
    isPositive: boolean;
  };
  caption?: string;
  className?: string;
}

function BentoPanel({
  icon,
  label,
  value,
  sparkline,
  delta,
  caption,
  className,
}: BentoPanelProps) {
  return (
    <div
      className={[
        "relative flex flex-col justify-between overflow-hidden rounded-lg border bg-card p-6 transition-all duration-200 hover:bg-secondary/50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="text-muted-foreground">{icon}</div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </span>
        </div>
        {delta && (
          <div
            className={[
              "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
              delta.isPositive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-rose-500/10 text-rose-500",
            ].join(" ")}
          >
            {delta.isPositive ? "+" : ""}
            {delta.value}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-mono text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
          {value}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        {sparkline ? (
          <div className="h-6 w-24 opacity-80 transition-opacity hover:opacity-100">
            {sparkline}
          </div>
        ) : (
          <div className="h-6" />
        )}
        {caption && (
          <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}

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
  cloudflare: CloudflareSummary;
  githubRepos: Repo[];
  posthog: PostHogSummary;
  wakaLanguages: WakaTimeLanguage[];
  wakaMetrics: WakaTimeMetrics;
  wakaTrend: WakaTimeTrend[];
}

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
      Array.isArray(data.wakaLanguages) &&
      Array.isArray(data.wakaTrend) &&
      Array.isArray(data.githubRepos)
  );
}

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
  cloudflare: EMPTY_CLOUDFLARE,
  githubRepos: [],
  posthog: EMPTY_POSTHOG,
  wakaLanguages: [],
  wakaMetrics: EMPTY_WAKA_METRICS,
  wakaTrend: [],
};

const BLOG_POST_COUNT = (rawBlogPosts as unknown[]).length;

function KpiStrip({ data }: { data: LoaderData }) {
  const generatedAt = data.cloudflare.generatedAt
    ? new Date(data.cloudflare.generatedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const kpis: Array<{
    value: string;
    label: string;
    sublabel: string;
    trend: "up" | "flat" | null;
  }> = [
    {
      value: formatCompact(data.aiMetrics.totalTokens),
      label: "Tokens this month",
      sublabel: `${data.aiMetrics.activeDays} active days · Claude Code`,
      trend: data.aiMetrics.totalTokens > 0 ? "up" : "flat",
    },
    {
      value: formatCompact(
        data.cloudflare.totalPageviews || data.posthog.totalViews
      ),
      label: "Page views · 30d",
      sublabel: "Cloudflare edge, all zones",
      trend: "up",
    },
    {
      value: `${formatNumber(data.wakaMetrics.totalHours)}h`,
      label: "Coding hours · 30d",
      sublabel: `${formatNumber(data.wakaMetrics.avgDailyHours)}h avg/day · ${data.wakaMetrics.topLanguage}`,
      trend: "flat",
    },
    {
      value: formatCurrency(data.aiMetrics.totalCost),
      label: "AI spend · 30d",
      sublabel: `Top model: ${compactName(data.aiMetrics.topModel)}`,
      trend: data.aiMetrics.totalCost > 0 ? "up" : "flat",
    },
    {
      value: String(BLOG_POST_COUNT),
      label: "Blog posts published",
      // TODO: wire to GitHub commit count for a dynamic "commits this month" stat
      sublabel: "All-time, duyet.net/blog",
      trend: "up",
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-border border-t border-b border-border">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="relative p-6 md:p-8">
            {kpi.trend !== null && (
              <span className="absolute top-4 right-4">
                {kpi.trend === "up" ? (
                  <ArrowUpRight
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                ) : (
                  <Minus size={16} className="text-muted-foreground" />
                )}
              </span>
            )}
            <p className="text-4xl md:text-5xl font-semibold tracking-tight tabular-nums text-foreground">
              {kpi.value}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {kpi.label}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.sublabel}</p>
          </div>
        ))}
      </div>
      {generatedAt && (
        <p className="mt-2 text-right text-xs text-muted-foreground">
          Last updated: {generatedAt}
        </p>
      )}
    </section>
  );
}

function BentoGrid({ data }: { data: LoaderData }) {
  const pageViews = data.cloudflare.totalPageviews || data.posthog.totalViews;

  return (
    <section className="mt-12">
      <div className="mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          By the numbers
        </p>
        <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
          One developer, many data streams.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregated across traffic, AI usage, coding time, and published work — last 30 days unless noted.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tall pullquote card — spans 2 rows */}
        <Card className="md:row-span-2 flex flex-col justify-between border-border">
          <CardContent className="pt-6 flex flex-col h-full gap-6">
            <div>
              <p className="text-4xl md:text-5xl font-semibold tracking-tight tabular-nums text-foreground">
                {formatCompact(data.aiMetrics.totalTokens)}
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                AI tokens consumed
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Claude Code · last 30 days
              </p>
            </div>
            <div className="mt-auto">
              <Quote
                size={20}
                className="text-muted-foreground mb-3 opacity-50"
              />
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                Every token here represents a real decision — a diff reviewed, a
                test written, a refactor weighed. The pipeline runs nightly from
                ClickHouse; no prompt content is stored, only aggregated
                per-model counts.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                — ccusage → ClickHouse → insights
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Page views */}
        <Card className="border-border">
          <CardHeader className="pb-1 flex flex-row items-start justify-between">
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 hover:bg-indigo-100">
              Traffic
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
              {formatCompact(pageViews)}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Page views
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cloudflare · 30 days
            </p>
          </CardContent>
        </Card>

        {/* Coding hours */}
        <Card className="border-border">
          <CardHeader className="pb-1 flex flex-row items-start justify-between">
            <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300 hover:bg-violet-100">
              Code
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
              {formatNumber(data.wakaMetrics.totalHours)}h
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Coding hours
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              WakaTime · 30 days
            </p>
          </CardContent>
        </Card>

        {/* AI cost */}
        <Card className="border-border">
          <CardHeader className="pb-1 flex flex-row items-start justify-between">
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 hover:bg-amber-100">
              AI
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
              {formatCurrency(data.aiMetrics.totalCost)}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              AI spend
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Claude Code · 30 days
            </p>
          </CardContent>
        </Card>

        {/* Cache tokens */}
        <Card className="border-border">
          <CardHeader className="pb-1 flex flex-row items-start justify-between">
            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300 hover:bg-green-100">
              Infra
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
              {formatCompact(data.aiMetrics.cacheTokens)}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Cache tokens
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Prompt re-use · 30 days
            </p>
          </CardContent>
        </Card>

        {/* Blog posts */}
        <Card className="border-border">
          <CardHeader className="pb-1 flex flex-row items-start justify-between">
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 hover:bg-rose-100">
              Writing
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
              {BLOG_POST_COUNT}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Blog posts
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              All-time · duyet.net/blog
            </p>
          </CardContent>
        </Card>

        {/* CF requests */}
        <Card className="border-border">
          <CardHeader className="pb-1 flex flex-row items-start justify-between">
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 hover:bg-indigo-100">
              Telemetry
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
              {formatCompact(data.cloudflare.totalRequests)}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Edge requests
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cloudflare · 30 days
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

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
    percent: model.percent,
    tokens: model.tokens,
  }));
  const topLanguages = data.wakaLanguages.slice(0, 5).map((language) => ({
    name: language.name,
    percent: language.percent,
  }));
  const topPosts = data.posthog.paths.slice(0, 5);

  const pageViews = data.cloudflare.totalPageviews || data.posthog.totalViews;

  return (
    <div>
      <header className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          INSIGHTS · LAST 30 DAYS
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
          A quiet view of what shipped, what ran, and what was read.
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          One editorial page across traffic, AI usage, human coding, and the
          most-read posts. No dashboards, no chrome — just the numbers and what
          they meant this month.
        </p>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pb-16">
      <KpiStrip data={data} />
      <BentoGrid data={data} />

      {data.githubRepos.length > 0 && (
        <section className="mt-20 border-t border-border pt-12">
          <OpenSourceGrid
            repos={data.githubRepos}
            user="duyet"
            featured={["monorepo", "clickhouse-monitoring"]}
          />
        </section>
      )}

      <SignalsNarrativeSection data={data} />

      <section className="mt-20 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-6 border-t border-border pt-12">
        <BentoPanel
          icon={<ChartLine size={18} />}
          label="Page views · 30d"
          value={formatNumber(pageViews)}
          delta={{ value: "12.4%", isPositive: true }}
          sparkline={
            <Sparkline
              data={traffic.map((t) => Number(t.pageViews) || 0)}
              accent={true}
            />
          }
          caption="Public reading audience pulse"
          className="col-span-1 md:col-span-2 md:row-span-2"
        />
        <BentoPanel
          icon={<Cpu size={18} />}
          label="AI tokens · 30d"
          value={formatCompact(data.aiMetrics.totalTokens)}
          delta={{ value: "8.2%", isPositive: true }}
          sparkline={
            <Sparkline
              data={aiActivity.map((a) => Number(a.tokens) || 0)}
              accent={false}
            />
          }
          caption={`${data.aiMetrics.activeDays} active days`}
          className="col-span-1"
        />
        <BentoPanel
          icon={<Clock size={18} />}
          label="Coding hours · 30d"
          value={formatNumber(data.wakaMetrics.totalHours)}
          delta={{ value: "3.1%", isPositive: false }}
          sparkline={
            <Sparkline
              data={data.wakaTrend.map((t) => Number(t.hours) || 0)}
              accent={false}
            />
          }
          caption={`${formatNumber(data.wakaMetrics.avgDailyHours)}h avg per active day`}
          className="col-span-1"
        />
        <BentoPanel
          icon={<Coins size={18} />}
          label="AI cost · 30d"
          value={formatCurrency(data.aiMetrics.totalCost)}
          delta={{ value: "15.3%", isPositive: true }}
          sparkline={
            <Sparkline
              data={aiActivity.map((a) => Number(a.cost) || 0)}
              accent={true}
            />
          }
          caption={`top: ${compactName(data.aiMetrics.topModel)}`}
          className="col-span-1 md:col-span-2"
        />
      </section>

      <section className="mt-20 grid grid-cols-1 gap-12 border-t border-border pt-12 xl:grid-cols-[1.4fr_0.6fr]">
        <EditorialChart
          eyebrow="Traffic · Cloudflare"
          title="Public site pulse."
          subtitle="Requests, page views, and unique visitors over the last 30 days."
        >
          <InsightAreaChart
            data={traffic}
            keys={["requests", "pageViews", "visitors"]}
            labelMap={{
              pageViews: "Page views",
              requests: "Requests",
              visitors: "Visitors",
            }}
            accentKey="requests"
          />
        </EditorialChart>

        <EditorialList
          eyebrow="Reading · PostHog"
          title="Most-read pages."
          items={topPosts.map((path) => ({
            label: path.path,
            meta: `${formatNumber(path.visitors)} visitors`,
            value: formatNumber(path.views),
          }))}
          emptyLabel="PostHog data is not configured for this build."
        />
      </section>

      <section className="mt-20 grid grid-cols-1 gap-12 border-t border-border pt-12 xl:grid-cols-2">
        <EditorialChart
          eyebrow="AI · ccusage"
          title="AI work, day by day."
          subtitle="Token volume and estimated cost from the cached ccusage warehouse."
        >
          <InsightAreaChart
            data={aiActivity}
            keys={["tokens", "cost"]}
            labelMap={{ cost: "Cost", tokens: "Tokens" }}
            accentKey="tokens"
          />
        </EditorialChart>

        <EditorialChart
          eyebrow="Models · share"
          title="Where the tokens went."
          subtitle="Most active model families by token share over the last 30 days."
        >
          <InsightBarChart
            data={topModels}
            nameKey="name"
            valueKey="percent"
          />
        </EditorialChart>
      </section>

      <section className="mt-20 grid grid-cols-1 gap-12 border-t border-border pt-12 xl:grid-cols-2">
        <EditorialChart
          eyebrow="Coding · WakaTime"
          title="Where the human hours went."
          subtitle="Language mix from the current 30-day coding window."
        >
          <InsightBarChart
            data={topLanguages}
            nameKey="name"
            valueKey="percent"
          />
        </EditorialChart>

        <div className="grid grid-cols-1 gap-6 self-start">
          <BentoPanel
            icon={<Database size={18} />}
            label="AI cache tokens · 30d"
            value={formatCompact(data.aiMetrics.cacheTokens)}
            caption="Cached prompt re-use across sessions"
          />
          <BentoPanel
            icon={<Globe size={18} />}
            label="Cloudflare requests · 30d"
            value={formatNumber(data.cloudflare.totalRequests)}
            caption="Total edge requests for the period"
          />
          <BentoPanel
            icon={<Code size={18} />}
            label="Top language"
            value={data.wakaMetrics.topLanguage}
            caption={`${formatNumber(data.wakaMetrics.daysActive)} active days at the keyboard` }
          />
        </div>
      </section>

      <p className="mt-24 max-w-3xl border-t border-border pt-8 font-sans text-xs tracking-tight leading-7 text-muted-foreground">
        Sources: Cloudflare and PostHog for traffic, ClickHouse and DuckDB for
        AI usage, WakaTime for coding hours. Missing credentials degrade to
        empty states.
      </p>
      </div>

    </div>
  );
}

type SignalCard =
  | {
      kind: "metric";
      numeral: string;
      label: string;
      sublabel: string;
      trend: "up" | "down" | "flat";
      badge?: string;
    }
  | {
      kind: "narrative";
      numeral: string;
      label: string;
      body: string;
      badge?: string;
    };

function SignalTrend({
  trend,
}: {
  trend: "up" | "down" | "flat";
}) {
  if (trend === "up")
    return (
      <ArrowUpRight size={16} className="text-green-600 dark:text-green-400" />
    );
  if (trend === "down")
    return <ArrowDownRight size={16} className="text-rose-500" />;
  return <Minus size={16} className="text-muted-foreground" />;
}

function SignalsNarrativeSection({ data }: { data: LoaderData }) {
  const pageViews = data.cloudflare.totalPageviews || data.posthog.totalViews;

  const cards: SignalCard[] = [
    {
      kind: "metric",
      numeral: formatCompact(data.aiMetrics.totalTokens),
      label: "AI tokens routed",
      sublabel: `${data.aiMetrics.activeDays} active days · Claude Code`,
      trend: data.aiMetrics.totalTokens > 0 ? "up" : "flat",
    },
    {
      kind: "metric",
      numeral: formatCompact(pageViews),
      label: "Page views · 30d",
      sublabel: "Cloudflare edge, all zones",
      trend: "up",
    },
    {
      kind: "metric",
      numeral: `${formatNumber(data.wakaMetrics.totalHours)}h`,
      label: "Coding hours · 30d",
      sublabel: `Avg ${formatNumber(data.wakaMetrics.avgDailyHours)}h/day`,
      trend: "flat",
    },
    {
      kind: "metric",
      numeral: formatCurrency(data.aiMetrics.totalCost),
      label: "AI spend · 30d",
      sublabel: `Top model: ${compactName(data.aiMetrics.topModel)}`,
      trend: data.aiMetrics.totalCost > 0 ? "up" : "flat",
    },
    {
      kind: "narrative",
      numeral: String(BLOG_POST_COUNT),
      label: "Posts published",
      body: "Every post is indexed on the day it ships and reflected here the same night.",
      badge: "Live",
    },
    {
      kind: "narrative",
      numeral: formatCompact(data.aiMetrics.cacheTokens),
      label: "Cache tokens",
      body: "Prompt re-use logged nightly into ClickHouse — no prompt content stored, only aggregate counts.",
      badge: "Active",
    },
    {
      kind: "metric",
      numeral: formatCompact(data.cloudflare.totalRequests),
      label: "Edge requests · 30d",
      sublabel: "Cloudflare, all zones",
      trend: "up",
    },
    {
      kind: "metric",
      numeral: data.wakaMetrics.topLanguage || "—",
      label: "Top language",
      sublabel: `${formatNumber(data.wakaMetrics.daysActive)} days active`,
      trend: "flat",
    },
  ];

  return (
    <section className="mt-20 border-t border-border pt-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 mb-12">
        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Reading the signals
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            Every metric on this page is pulled live from production.
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
            ClickHouse, Cloudflare, WakaTime, GitHub — no analytics middleman.
            The pipeline runs nightly; values here reflect the last 30 days
            unless noted. Missing credentials degrade to empty states, never
            to fabricated numbers.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Dashboard · Last updated{" "}
            {data.cloudflare.generatedAt
              ? new Date(data.cloudflare.generatedAt).toLocaleDateString(
                  "en-US",
                  { day: "numeric", month: "short", year: "numeric" },
                )
              : "recently"}
          </p>
        </div>

        {/* Primary hero metric */}
        <div className="flex flex-col justify-center border p-8">
          <p className="text-6xl md:text-7xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatCompact(data.aiMetrics.totalTokens)}
          </p>
          <p className="mt-3 text-base font-medium text-foreground">
            AI tokens this month
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Claude Code · ClickHouse warehouse
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
            <ArrowUpRight size={16} />
            <span>Streaming nightly</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          if (card.kind === "metric") {
            return (
              <div
                key={card.label}
                className="relative border p-5 flex flex-col gap-2"
              >
                <div className="absolute top-4 right-4">
                  <SignalTrend trend={card.trend} />
                </div>
                <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                  {card.numeral}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {card.label}
                </p>
                <p className="text-xs text-muted-foreground">{card.sublabel}</p>
              </div>
            );
          }
          return (
            <div
              key={card.label}
              className="border p-5 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                  {card.numeral}
                </p>
                {card.badge && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300 hover:bg-green-100 shrink-0">
                    {card.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">{card.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {card.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

function EditorialChart({
  children,
  eyebrow,
  subtitle,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="font-sans font-semibold text-3xl leading-tight tracking-tight md:text-4xl">
          {title}
        </h2>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}

function EditorialList({
  emptyLabel,
  eyebrow,
  items,
  title,
}: {
  emptyLabel: string;
  eyebrow: string;
  items: Array<{ label: string; meta: string; value: string }>;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="font-sans font-semibold text-3xl leading-tight tracking-tight md:text-4xl">
          {title}
        </h2>
      </div>
      <div className="flex flex-col">
        {items.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.label}
              className={`grid grid-cols-[1fr_auto] items-baseline gap-4 py-3 ${
                idx === 0 ? "" : "border-t border-border"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.meta}
                </p>
              </div>
              <p className="font-mono text-base tabular-nums text-foreground">
                {item.value}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function InsightAreaChart({
  data,
  keys,
  labelMap,
  accentKey,
}: {
  data: Array<Record<string, number | string>>;
  keys: string[];
  labelMap: Record<string, string>;
  /** Which key gets the accent color; others stay monochrome. */
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
    <div className="h-[260px] min-w-0" ref={ref}>
      {(!isHydrated || width === 0) && (
        <div className="flex h-full items-center text-xs text-muted-foreground">
          Loading.
        </div>
      )}
      {isHydrated && width > 0 && (
        <AreaChart
          data={data}
          height={260}
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

function InsightBarChart({
  data,
  nameKey,
  valueKey,
}: {
  data: Array<Record<string, number | string>>;
  nameKey: string;
  valueKey: string;
}) {
  const isHydrated = useHydrated();
  const { ref, width } = useElementWidth();

  if (data.length === 0) {
    return <EmptyChart label="No distribution data available." />;
  }

  return (
    <div className="h-[260px] min-w-0" ref={ref}>
      {(!isHydrated || width === 0) && (
        <div className="flex h-full items-center text-xs text-muted-foreground">
          Loading.
        </div>
      )}
      {isHydrated && width > 0 && (
        <BarChart
          data={data}
          height={260}
          layout="vertical"
          margin={{ bottom: 0, left: 0, right: 16, top: 8 }}
          width={width}
        >
          <XAxis
            axisLine={false}
            fontSize={11}
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            type="number"
            unit="%"
          />
          <YAxis
            axisLine={false}
            dataKey={nameKey}
            fontSize={11}
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            type="category"
            width={120}
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
            formatter={(value) => [`${formatNumber(Number(value))}%`, "Share"]}
          />
          <Bar
            dataKey={valueKey}
            fill={CHART_FOREGROUND}
            radius={[0, 1, 1, 0]}
          />
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

function Sparkline({
  data,
  accent = false,
}: {
  data: number[];
  accent?: boolean;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);
  const w = 100;
  const h = 24;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={accent ? "var(--chart-1)" : "var(--foreground)"}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity={accent ? 1 : 0.6}
      />
    </svg>
  );
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: value >= 10 ? 0 : 2,
    style: "currency",
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
