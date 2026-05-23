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
import { EditorialPanel } from "@/components/EditorialPanel";
import { InsightsPageHeader } from "@/components/layouts/InsightsPageShell";

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

const CHART_FOREGROUND = "var(--foreground)";
const CHART_SUBTLE = "var(--subtle)";
const CHART_ACCENT = "var(--accent)";
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
      <InsightsPageHeader
        badge="Overview · last 30 days"
        title="A quiet view of what shipped, what ran, and what was read."
        description="One editorial page across traffic, AI usage, human coding, and the most-read posts. No dashboards, no chrome — just the numbers and what they meant this month."
      />

      <section className="editorial-stagger editorial-fade-up grid grid-cols-2 gap-x-8 gap-y-12 border-t border-[color:var(--hairline)] pt-12 md:grid-cols-4">
        <EditorialPanel
          label="Page views · 30d"
          value={formatNumber(pageViews)}
          sparkline={
            <Sparkline
              data={traffic.map((t) => Number(t.pageViews) || 0)}
              accent={false}
            />
          }
        />
        <EditorialPanel
          label="AI tokens · 30d"
          value={formatCompact(data.aiMetrics.totalTokens)}
          caption={`${data.aiMetrics.activeDays} active days`}
        />
        <EditorialPanel
          label="Coding hours · 30d"
          value={formatNumber(data.wakaMetrics.totalHours)}
          caption={`${formatNumber(data.wakaMetrics.avgDailyHours)} avg per active day`}
        />
        <EditorialPanel
          label="AI cost · 30d"
          value={formatCurrency(data.aiMetrics.totalCost)}
          caption={`top model: ${compactName(data.aiMetrics.topModel)}`}
        />
      </section>

      <section className="editorial-fade-up mt-20 grid grid-cols-1 gap-12 border-t border-[color:var(--hairline)] pt-12 xl:grid-cols-[1.4fr_0.6fr]">
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

      <section className="editorial-fade-up mt-20 grid grid-cols-1 gap-12 border-t border-[color:var(--hairline)] pt-12 xl:grid-cols-2">
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

      <section className="editorial-fade-up mt-20 grid grid-cols-1 gap-12 border-t border-[color:var(--hairline)] pt-12 xl:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-10 self-start">
          <EditorialPanel
            label="AI cache tokens · 30d"
            value={formatCompact(data.aiMetrics.cacheTokens)}
            caption="Cached prompt re-use across recent sessions."
          />
          <EditorialPanel
            label="Cloudflare requests · 30d"
            value={formatNumber(data.cloudflare.totalRequests)}
            caption="Total edge requests for the period."
          />
          <EditorialPanel
            label="Top language"
            value={data.wakaMetrics.topLanguage}
            caption={`${formatNumber(data.wakaMetrics.daysActive)} active days at the keyboard.`}
          />
        </div>
      </section>

      <p className="editorial-fade-up mt-24 max-w-3xl border-t border-[color:var(--hairline)] pt-8 font-serif text-sm italic leading-7 text-[color:var(--muted)]">
        Sources: Cloudflare and PostHog for traffic, ClickHouse and DuckDB for
        AI usage, WakaTime for coding hours. Missing credentials degrade to
        empty states.
      </p>
    </div>
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
        <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
          {eyebrow}
        </p>
        <h2 className="font-serif text-3xl leading-tight tracking-tight md:text-4xl">
          {title}
        </h2>
        <p className="max-w-xl text-sm leading-6 text-[color:var(--muted)]">
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
        <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
          {eyebrow}
        </p>
        <h2 className="font-serif text-3xl leading-tight tracking-tight md:text-4xl">
          {title}
        </h2>
      </div>
      <div className="flex flex-col">
        {items.length === 0 ? (
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            {emptyLabel}
          </p>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.label}
              className={`grid grid-cols-[1fr_auto] items-baseline gap-4 py-3 ${
                idx === 0 ? "" : "border-t border-[color:var(--hairline)]"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-[color:var(--foreground)]">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  {item.meta}
                </p>
              </div>
              <p className="font-mono text-base tabular-nums text-[color:var(--foreground)]">
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
        <div className="flex h-full items-center text-xs text-[color:var(--insights-chart-placeholder-text)]">
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
            tick={{ fill: "var(--muted)" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            fontSize={11}
            tick={{ fill: "var(--muted)" }}
            tickLine={false}
            tickMargin={8}
            width={36}
          />
          <Tooltip
            cursor={{ stroke: "var(--subtle)", strokeWidth: 1 }}
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
        <div className="flex h-full items-center text-xs text-[color:var(--insights-chart-placeholder-text)]">
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
            tick={{ fill: "var(--muted)" }}
            tickLine={false}
            type="number"
            unit="%"
          />
          <YAxis
            axisLine={false}
            dataKey={nameKey}
            fontSize={11}
            tick={{ fill: "var(--muted)" }}
            tickLine={false}
            type="category"
            width={120}
          />
          <Tooltip
            cursor={{ fill: "var(--faint)" }}
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
    <div className="flex h-[200px] items-center text-sm text-[color:var(--insights-chart-placeholder-text)]">
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
        stroke={accent ? "var(--accent)" : "var(--foreground)"}
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
