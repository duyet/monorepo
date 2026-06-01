import type {
  AiMetrics,
  CloudflareSummary,
  LoaderData,
  PostHogSummary,
  WakaTimeMetrics,
} from "./types";

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

const CHART_FOREGROUND = "var(--foreground)";
const CHART_SUBTLE = "var(--muted-foreground)";
const CHART_ACCENT = "var(--chart-1)";
const CHART_TOOLTIP_BACKGROUND = "var(--insights-chart-tooltip-bg)";
const CHART_TOOLTIP_TEXT = "var(--insights-chart-tooltip-text)";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.duyet.net";

export {
  EMPTY_AI_METRICS,
  EMPTY_WAKA_METRICS,
  EMPTY_CLOUDFLARE,
  EMPTY_POSTHOG,
  EMPTY_LOADER_DATA,
  CHART_FOREGROUND,
  CHART_SUBTLE,
  CHART_ACCENT,
  CHART_TOOLTIP_BACKGROUND,
  CHART_TOOLTIP_TEXT,
  API_BASE_URL,
};
