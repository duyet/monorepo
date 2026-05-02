import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  Clock3,
  Code2,
  Eye,
  Globe2,
  Radio,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const PANEL_COLORS = [
  "var(--insights-panel-blue)",
  "var(--insights-panel-emerald)",
  "var(--insights-panel-coral)",
  "var(--insights-panel-orange)",
  "var(--insights-panel-lilac)",
];
const CHART_ORANGE = "var(--insights-chart-accent)";
const CHART_BLACK = "var(--insights-chart-ink)";
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
  ] = await Promise.allSettled([
    aiData.getCCUsageMetrics(30),
    aiData.getCCUsageActivity(30),
    aiData.getCCUsageModels(30),
    wakaData.getWakaTimeMetrics(30),
    wakaData.getWakaTimeLanguages(30),
    wakaData.getWakaTimeMonthlyTrend(),
    blogData.fetchCloudflareData(30),
    posthogData.fetchPostHogData(30),
  ]);

  return {
    aiActivity: settled(aiActivity, []),
    aiMetrics: settled(aiMetrics, EMPTY_AI_METRICS),
    aiModels: settled(aiModels, []),
    cloudflare: settled(cloudflare, EMPTY_CLOUDFLARE),
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
      Array.isArray(data.wakaTrend)
  );
}

export const Route = createFileRoute("/")({
  loader: async (): Promise<LoaderData> =>
    import.meta.env.SSR
      ? loadOverviewDataForStaticBuild()
      : fetchOverviewDataFromApi(),
  head: () => ({
    meta: [
      { title: "@duyet Insights Dashboard" },
      {
        name: "description",
        content:
          "Operational analytics for duyet.net across traffic, AI usage, coding activity, and content.",
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
  posthog: EMPTY_POSTHOG,
  wakaLanguages: [],
  wakaMetrics: EMPTY_WAKA_METRICS,
  wakaTrend: [],
};

function IndexPage() {
  const data = Route.useLoaderData();
  const traffic = getTrafficData(data.cloudflare);
  const aiActivity = data.aiActivity.map((item) => ({
    cost: Number(item["Total Cost"].toFixed(2)),
    date: shortDate(item.date),
    tokens: item["Total Tokens"],
  }));
  const monthlyCoding = data.wakaTrend.slice(-8).map((item) => ({
    date: item.displayDate,
    hours: item.hours,
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

  return (
    <div className="space-y-12">
      <section className="grid gap-8 pt-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:pt-14">
        <div className="min-w-0">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-white">
            <Radio className="h-4 w-4 text-[#ff6a00]" />
            Live operating view
          </div>
          <h1 className="max-w-5xl text-balance font-semibold text-5xl tracking-tight sm:text-6xl lg:text-7xl">
            Signals across code, content, traffic, and AI work.
          </h1>
          <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-[#4d4d4d] dark:text-[#cfcfc8]">
            A compact dashboard for the Duyet network: what people read, what
            systems are used, how much coding happened, and where AI spend is
            moving.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          <MetricTile
            icon={Eye}
            label="Page views"
            tone="#cfe2f3"
            value={formatNumber(
              data.cloudflare.totalPageviews || data.posthog.totalViews
            )}
          />
          <MetricTile
            icon={Bot}
            label="AI tokens"
            tone="#b8efd2"
            value={formatCompact(data.aiMetrics.totalTokens)}
          />
          <MetricTile
            icon={Clock3}
            label="Coding hours"
            tone="#f6c5c7"
            value={formatNumber(data.wakaMetrics.totalHours)}
          />
          <MetricTile
            icon={Zap}
            label="AI cost"
            tone="#fde3bf"
            value={formatCurrency(data.aiMetrics.totalCost)}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          href="/blog"
          icon={Globe2}
          label="Traffic"
          metric={formatNumber(data.cloudflare.totalRequests)}
          summary="Cloudflare request volume and visitor movement for the public network."
          tone="#cfe2f3"
        />
        <StatusCard
          href="/ai"
          icon={Sparkles}
          label="AI Usage"
          metric={data.aiMetrics.topModel}
          summary={`${formatCompact(data.aiMetrics.cacheTokens)} cache tokens across ${data.aiMetrics.activeDays} active days.`}
          tone="#b8efd2"
        />
        <StatusCard
          href="/wakatime"
          icon={Code2}
          label="Coding"
          metric={data.wakaMetrics.topLanguage}
          summary={`${formatNumber(data.wakaMetrics.avgDailyHours)} average hours per active day.`}
          tone="#f6c5c7"
        />
        <StatusCard
          href="/github"
          icon={BarChart3}
          label="Repositories"
          metric="Open source"
          summary="GitHub, coding activity, and public project signals stay one click away."
          tone="#ded1ea"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <ChartPanel
          eyebrow="Traffic"
          subtitle="Requests, page views, and unique visitors from Cloudflare."
          title="Public site pulse"
        >
          <InsightAreaChart
            colors={[CHART_BLACK, CHART_ORANGE, "#4f83b8"]}
            data={traffic}
            keys={["requests", "pageViews", "visitors"]}
            labelMap={{
              pageViews: "Page views",
              requests: "Requests",
              visitors: "Visitors",
            }}
          />
        </ChartPanel>

        <ListPanel
          eyebrow="Content"
          emptyLabel="PostHog data is not configured for this build."
          items={topPosts.map((path) => ({
            label: path.path,
            meta: `${formatNumber(path.visitors)} visitors`,
            value: formatNumber(path.views),
          }))}
          title="Most-read pages"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartPanel
          eyebrow="AI"
          subtitle="Token volume and cost from the cached ccusage warehouse."
          title="AI work trend"
        >
          <InsightAreaChart
            colors={[CHART_ORANGE, CHART_BLACK]}
            data={aiActivity}
            keys={["tokens", "cost"]}
            labelMap={{ cost: "Cost", tokens: "K tokens" }}
          />
        </ChartPanel>

        <ChartPanel
          eyebrow="Coding"
          subtitle="Monthly WakaTime trend for recent engineering activity."
          title="Build cadence"
        >
          <InsightAreaChart
            colors={["#1a1a1a"]}
            data={monthlyCoding}
            keys={["hours"]}
            labelMap={{ hours: "Hours" }}
          />
        </ChartPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartPanel
          eyebrow="Models"
          subtitle="The most active model families by token share."
          title="AI model mix"
        >
          <InsightBarChart data={topModels} nameKey="name" valueKey="percent" />
        </ChartPanel>

        <ChartPanel
          eyebrow="Languages"
          subtitle="Language mix from the current coding period."
          title="Code attention"
        >
          <InsightBarChart
            data={topLanguages}
            nameKey="name"
            valueKey="percent"
          />
        </ChartPanel>
      </section>

      <section className="grid gap-4 border-t border-black/10 pt-8 dark:border-white/15 md:grid-cols-3">
        <SourceNote
          icon={Globe2}
          label="Cloudflare + PostHog"
          text="Traffic and content queries degrade to empty states when credentials are absent."
        />
        <SourceNote
          icon={Bot}
          label="ClickHouse + DuckDB"
          text="AI metrics try server-only ClickHouse first, then use cached DuckDB snapshots."
        />
        <SourceNote
          icon={Code2}
          label="WakaTime"
          text="Coding totals come from WakaTime stats and insights endpoints."
        />
      </section>
    </div>
  );
}

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

function MetricTile({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof Eye;
  label: string;
  tone: string;
  value: string;
}) {
  return (
    <div
      className="min-w-0 rounded-xl p-4 text-[#1a1a1a] shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]"
      style={{ backgroundColor: tone }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-black/65">{label}</p>
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      <p className="mt-8 truncate text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function StatusCard({
  href,
  icon: Icon,
  label,
  metric,
  summary,
  tone,
}: {
  href: string;
  icon: typeof Eye;
  label: string;
  metric: string;
  summary: string;
  tone: string;
}) {
  return (
    <Link
      className="group flex min-h-52 flex-col rounded-xl p-5 text-[#1a1a1a] transition-transform duration-200 hover:-translate-y-1"
      style={{ backgroundColor: tone }}
      to={href}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-black/60">{label}</p>
          <h2 className="mt-3 break-words text-2xl font-semibold tracking-tight">
            {metric}
          </h2>
        </div>
        <Icon className="h-6 w-6 shrink-0" />
      </div>
      <p className="mt-auto text-sm leading-6 text-black/70">{summary}</p>
      <ArrowUpRight className="mt-5 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Link>
  );
}

function ChartPanel({
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
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.08),0_22px_60px_rgba(0,0,0,0.06)] dark:bg-[#171815]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#ff6a00]">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {title}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-black/60 dark:text-white/60">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}

function ListPanel({
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
    <div className="rounded-xl bg-[#1a1a1a] p-5 text-white shadow-[0_22px_60px_rgba(0,0,0,0.16)]">
      <p className="text-sm font-medium text-[#ffb27c]">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm leading-6 text-white/60">{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <div
              className="grid grid-cols-[1fr_auto] gap-4 border-t border-white/12 pt-4 first:border-t-0 first:pt-0"
              key={item.label}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs text-white/55">{item.meta}</p>
              </div>
              <p className="text-sm font-semibold text-white">{item.value}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function InsightAreaChart({
  colors,
  data,
  keys,
  labelMap,
}: {
  colors: string[];
  data: Array<Record<string, number | string>>;
  keys: string[];
  labelMap: Record<string, string>;
}) {
  const isHydrated = useHydrated();
  const { ref, width } = useElementWidth();

  if (data.length === 0) {
    return <EmptyChart label="No data available for this period." />;
  }

  return (
    <div className="h-[280px] min-w-0" ref={ref}>
      {(!isHydrated || width === 0) && (
        <div className="flex h-full items-center justify-center rounded-lg bg-black/[0.03] text-sm text-black/55 dark:bg-white/[0.06] dark:text-white/55">
          Chart loading.
        </div>
      )}
      {isHydrated && width > 0 && (
        <AreaChart
          data={data}
          height={280}
          margin={{ bottom: 0, left: -16, right: 8, top: 8 }}
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
                  stopColor={colors[index % colors.length]}
                  stopOpacity={0.28}
                />
                <stop
                  offset="95%"
                  stopColor={colors[index % colors.length]}
                  stopOpacity={0.02}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            stroke="#1a1a1a"
            strokeDasharray="3 3"
            strokeOpacity={0.08}
          />
          <XAxis
            axisLine={false}
            dataKey="date"
            fontSize={12}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            fontSize={12}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "0",
              borderRadius: "8px",
              color: "white",
              fontSize: "12px",
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
              stroke={colors[index % colors.length]}
              strokeWidth={2.5}
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
    <div className="h-[280px] min-w-0" ref={ref}>
      {(!isHydrated || width === 0) && (
        <div className="flex h-full items-center justify-center rounded-lg bg-black/[0.03] text-sm text-black/55 dark:bg-white/[0.06] dark:text-white/55">
          Chart loading.
        </div>
      )}
      {isHydrated && width > 0 && (
        <BarChart
          data={data}
          height={280}
          layout="vertical"
          margin={{ bottom: 0, left: 8, right: 16, top: 8 }}
          width={width}
        >
          <CartesianGrid
            horizontal={false}
            stroke="#1a1a1a"
            strokeOpacity={0.08}
          />
          <XAxis
            axisLine={false}
            fontSize={12}
            tickLine={false}
            type="number"
            unit="%"
          />
          <YAxis
            axisLine={false}
            dataKey={nameKey}
            fontSize={12}
            tickLine={false}
            type="category"
            width={112}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "0",
              borderRadius: "8px",
              color: "white",
              fontSize: "12px",
            }}
            formatter={(value) => [`${formatNumber(Number(value))}%`, "Share"]}
          />
          <Bar dataKey={valueKey} radius={[0, 8, 8, 0]}>
            {data.map((item, index) => (
              <Cell
                fill={PANEL_COLORS[index % PANEL_COLORS.length]}
                key={String(item[nameKey])}
              />
            ))}
          </Bar>
        </BarChart>
      )}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-lg bg-black/[0.03] text-sm text-black/55 dark:bg-white/[0.06] dark:text-white/55">
      {label}
    </div>
  );
}

function SourceNote({
  icon: Icon,
  label,
  text,
}: {
  icon: typeof Eye;
  label: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-1 h-5 w-5 shrink-0 text-[#ff6a00]" />
      <div>
        <h3 className="font-semibold">{label}</h3>
        <p className="mt-1 text-sm leading-6 text-black/60 dark:text-white/60">
          {text}
        </p>
      </div>
    </div>
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
