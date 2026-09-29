/**
 * Everything the overview route computes that is not rendering.
 *
 * `buildOverviewModel` is a total function of the loader data: no React, no
 * fetching, no module state. The route calls it once and hands each section the
 * handful of values it needs, which is what turns a 485-line component into a
 * list of sections.
 *
 * **No `useMemo`, deliberately.** Every value here is derived from
 * `Route.useLoaderData()`, which is a stable object for the life of a render
 * pass — TanStack Router replaces the whole route component's data, not
 * mutates it. The inputs are 30-row arrays; the derivations are a handful of
 * `map`/`reduce`/`slice` passes. Wrapping any of this in `useMemo` would add a
 * hook, a dependency array to keep correct, and a cached value to compare on
 * every subsequent render, in exchange for skipping microseconds of work that
 * only happens when the data actually changed — in which case React re-renders
 * the component anyway. The one place it would pay off is a `useMemo` whose
 * result is passed to a memoized chart across many small re-renders; the
 * overview page has no such re-render (no store subscription, no animation
 * state), so there is nothing to memoize against.
 *
 * The rendered output is pinned byte-for-byte by
 * `src/routes/index.render.test.tsx`, which is what makes this safe to
 * restructure.
 */
import type { KpiTileData } from "./KpiTile";
import {
  buildKpis,
  buildSparklines,
  deriveBurnMetrics,
  deriveTokenBreakdown,
  formatGeneratedAt,
  resolvePageViews,
  toActivitySeries,
  toCacheRatioSeries,
  toRepoCards,
  toTokenBuckets,
  topLanguages,
  topModels,
  topPosts,
  topProjects,
  type BurnMetrics,
  type CacheRatioRow,
  type RepoCard,
  type Share,
  type TokenTotals,
} from "./derive";
import { getTrafficData } from "./helpers";
import { deriveBilling, deriveSuggestions } from "./suggestions";
import type { BillingSummary, InsightSuggestion } from "./suggestions";
import type {
  AiMetrics,
  LoaderData,
  PostHogPath,
} from "./types";

export interface OverviewModel {
  aiMetrics: AiMetrics;
  billing: BillingSummary;
  burn: BurnMetrics;
  cacheRatio: CacheRatioRow[];
  costTypeShares: Share[];
  generatedAt: string | null;
  hourly: Array<{ label: string; Tokens: number; key: number }>;
  weekday: Array<{ label: string; Tokens: number; key: number }>;
  kpis: KpiTileData[];
  languageShare: Array<{ name: string; pct: number }>;
  modelShare: Array<{ name: string; pct: number }>;
  projectLeaderboard: ReturnType<typeof topProjects>;
  repos: RepoCard[];
  suggestions: InsightSuggestion[];
  tokenSums: TokenTotals;
  tokenTypeShares: Share[];
  topPosts: PostHogPath[];
  totalStars: number;
  blogUrl: string;
}

function buildOverviewModel(data: LoaderData): OverviewModel {
  const traffic = getTrafficData(data.cloudflare);

  // ---- Derived breakdowns from daily activity ----
  const { tokenSums, tokenTypeShares, costTypeShares } =
    deriveTokenBreakdown(data.aiActivity);

  // ---- Token burn metrics ----
  const burn = deriveBurnMetrics(
    data.aiMetrics,
    tokenSums,
    data.projectLeaderboard.length
  );

  const aiActivity = toActivitySeries(data.aiActivity);
  const { repos, totalStars } = toRepoCards(data.githubRepos);

  return {
    aiMetrics: data.aiMetrics,
    billing: deriveBilling(data),
    burn,
    cacheRatio: toCacheRatioSeries(data.cacheRatio),
    costTypeShares,
    generatedAt: formatGeneratedAt(data.cloudflare.generatedAt),
    hourly: toTokenBuckets(data.activityByHour),
    weekday: toTokenBuckets(data.activityByWeekday),
    kpis: buildKpis({
      wakaMetrics: data.wakaMetrics,
      aiMetrics: data.aiMetrics,
      pageViews: resolvePageViews(
        data.cloudflare.totalPageviews,
        data.posthog.totalViews
      ),
      ...buildSparklines({
        wakaTrend: data.wakaTrend,
        traffic,
        aiActivity,
      }),
    }),
    languageShare: topLanguages(data.wakaLanguages),
    modelShare: topModels(data.aiModels),
    projectLeaderboard: topProjects(data.projectLeaderboard),
    repos,
    suggestions: deriveSuggestions(data),
    tokenSums,
    tokenTypeShares,
    topPosts: topPosts(data.posthog.paths),
    totalStars,
    blogUrl: data.posthog.blogUrl,
  };
}

export { buildOverviewModel };
