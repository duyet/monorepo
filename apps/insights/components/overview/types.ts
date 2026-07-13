import type { Repo } from "@duyet/components";
import type {
  CCUsageActivityByModelData,
  CCUsageEfficiencyData,
  CCUsageProjectData,
} from "@/app/ai/types";

interface AiActivity {
  "Total Cost": number;
  "Total Tokens": number;
  "Input Tokens": number;
  "Output Tokens": number;
  "Cache Tokens": number;
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

interface CacheRatioPoint {
  date: string;
  pct: number;
  totalTokens: number;
  cacheTokens: number;
}

interface ModelCostShare {
  name: string;
  cost: number;
  tokens: number;
  pct: number;
}

interface BucketedActivity {
  label: string;
  key: number;
  tokens: number;
  cost: number;
  days: number;
}

interface ProjectLeaderboardEntry {
  name: string;
  tokens: number;
  cost: number;
  pct: number;
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
  cacheRatio: CacheRatioPoint[];
  modelCostShare: ModelCostShare[];
  activityByWeekday: BucketedActivity[];
  activityByHour: BucketedActivity[];
  projectLeaderboard: ProjectLeaderboardEntry[];
  cloudflare: CloudflareSummary;
  githubRepos: Repo[];
  posthog: PostHogSummary;
  wakaLanguages: WakaTimeLanguage[];
  wakaMetrics: WakaTimeMetrics;
  wakaTrend: WakaTimeTrend[];
}

export type {
  AiActivity,
  AiMetrics,
  AiModel,
  WakaTimeMetrics,
  WakaTimeLanguage,
  WakaTimeTrend,
  TrafficGroup,
  CloudflareData,
  CloudflareSummary,
  PostHogPath,
  PostHogSummary,
};
