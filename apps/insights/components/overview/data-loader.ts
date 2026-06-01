import { fetchGitHubRepos } from "@duyet/components";
import type { LoaderData } from "./types";
import {
  EMPTY_AI_METRICS,
  EMPTY_CLOUDFLARE,
  EMPTY_LOADER_DATA,
  EMPTY_POSTHOG,
  EMPTY_WAKA_METRICS,
  API_BASE_URL,
} from "./constants";
import { settled } from "./helpers";

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

export { loadOverviewDataForStaticBuild, fetchOverviewDataFromApi, isLoaderData };
