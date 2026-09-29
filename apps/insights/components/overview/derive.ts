/**
 * Pure derivations for the overview route.
 *
 * Everything here is a total function of already-loaded `LoaderData`: no
 * fetching, no React, no module state. The route component stays JSX-only and
 * the arithmetic — percentage shares, drift normalisation, trend deltas — gets
 * unit tests instead of being re-verified by reading a 677-line file.
 *
 * The float expressions are reproduced verbatim from the route, including the
 * deliberately redundant `(total * share) / total` form in the cost
 * percentages. It is algebraically a no-op, but it is *not* bit-identical to
 * the simplified expression in IEEE-754, and these values are rendered, so the
 * long form stays until someone verifies the output against real data.
 */
import type { Repo } from "@duyet/components";
import {
  compactName,
  formatCompact,
  formatNumber,
  shortDate,
} from "./helpers";
import type {
  AiActivity,
  AiMetrics,
  AiModel,
  BucketedActivity,
  CacheRatioPoint,
  PostHogPath,
  ProjectLeaderboardEntry,
  WakaTimeLanguage,
  WakaTimeMetrics,
  WakaTimeTrend,
} from "./types";
import type { KpiTileData } from "./KpiTile";

/** Token totals by category. */
export interface TokenTotals {
  input: number;
  output: number;
  cache: number;
}

/** One donut/row entry: a label, an amount, and a share of the total. */
export interface Share {
  name: string;
  cost: number;
  pct: number;
}

export interface TokenBreakdown {
  tokenSums: TokenTotals;
  totalTokensDerived: number;
  totalAiCost: number;
  tokenTypeShares: Share[];
  costTypeShares: Share[];
}

const CATEGORIES = ["input", "output", "cache"] as const;

/**
 * Split daily AI activity into token-category and cost-category shares.
 *
 * Cost is not stored per token type, so the cost split is proportional to the
 * token split. Each cost row's `pct` is then nudged so the three add up to
 * exactly 100 — the donut otherwise reads 3 + 0 + 97 and the reader has to do
 * the arithmetic. Rounding each share to 0.1 is what makes the drift possible
 * in the first place.
 */
export function deriveTokenBreakdown(
  aiActivity: AiActivity[]
): TokenBreakdown {
  const tokenSums = aiActivity.reduce(
    (acc, day) => {
      acc.input += day["Input Tokens"] ?? 0;
      acc.output += day["Output Tokens"] ?? 0;
      acc.cache += day["Cache Tokens"] ?? 0;
      return acc;
    },
    { input: 0, output: 0, cache: 0 }
  );
  const totalTokensDerived =
    tokenSums.input + tokenSums.output + tokenSums.cache;

  const pctOf = (tokens: number) =>
    totalTokensDerived > 0
      ? Math.round((tokens / totalTokensDerived) * 1000) / 10
      : 0;

  const label = (category: string) =>
    `${category[0].toUpperCase()}${category.slice(1)}`;

  const tokenTypeShares: Share[] = CATEGORIES.map((category) => ({
    name: label(category),
    cost: tokenSums[category],
    pct: pctOf(tokenSums[category]),
  }));

  const totalAiCost = aiActivity.reduce((s, d) => s + (d["Total Cost"] ?? 0), 0);

  const costTypeShares: Share[] =
    totalTokensDerived > 0
      ? CATEGORIES.map((category) => {
          const share = (totalAiCost * tokenSums[category]) / totalTokensDerived;
          return {
            name: `${label(category)} Cost`,
            cost: share,
            pct: Math.round((share / totalAiCost) * 1000) / 10 || 0,
          };
        })
      : [];

  // Normalise cost pct to sum exactly 100
  const costPctSum = costTypeShares.reduce((s, r) => s + r.pct, 0);
  const costDrift = 100 - costPctSum;
  if (costTypeShares.length > 0 && Math.abs(costDrift) > 0.01) {
    costTypeShares[0].pct = Math.max(
      0,
      Math.round(costTypeShares[0].pct + costDrift)
    );
  }

  return {
    tokenSums,
    totalTokensDerived,
    totalAiCost,
    tokenTypeShares,
    costTypeShares,
  };
}

export interface BurnMetrics {
  /** Input:output token ratio, or "—" when no output tokens were recorded. */
  ioRatio: string;
  avgTokensPerDay: string;
  cacheRate: string;
  projectCount: number;
}

/**
 * The four "token burn" tiles. Each returns an already-formatted string (or
 * "—" when the denominator is zero) because a formatted string is all the
 * tiles render.
 *
 * `ioRatio` comes from the token-category sums rather than `aiMetrics`, which
 * counts cache tokens too and would collapse the ratio towards 1.
 */
export function deriveBurnMetrics(
  aiMetrics: AiMetrics,
  tokenSums: TokenTotals,
  projectCount: number
): BurnMetrics {
  const activeDays = aiMetrics.activeDays || 1;
  return {
    ioRatio:
      tokenSums.output > 0
        ? (tokenSums.input / tokenSums.output).toFixed(1)
        : "—",
    avgTokensPerDay: formatCompact(aiMetrics.totalTokens / activeDays),
    cacheRate:
      aiMetrics.totalTokens > 0
        ? `${Math.round((aiMetrics.cacheTokens / aiMetrics.totalTokens) * 100)}%`
        : "—",
    projectCount,
  };
}

/**
 * Real period-over-period delta: mean of the second half of the series vs the
 * first half. Returns "—" when the series is too short or the baseline is zero
 * (an undefined ratio, not a synthetic +100%).
 */
export function trendPct(series: number[]): string {
  const s = series.filter((n) => Number.isFinite(n));
  if (s.length < 4) return "—";
  const mid = Math.floor(s.length / 2);
  const mean = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
  const first = mean(s.slice(0, mid));
  const second = mean(s.slice(mid));
  if (first === 0) return "—";
  // |first| in the denominator keeps the real sign for a negative baseline.
  const pct = Math.round(((second - first) / Math.abs(first)) * 1000) / 10;
  if (Math.abs(pct) < 0.05) return "0.0%";
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

/** Reshape weekday/hour buckets into the distribution-chart row shape. */
export function toTokenBuckets(
  rows: BucketedActivity[]
): Array<{ label: string; Tokens: number; key: number }> {
  return rows.map((d) => ({ label: d.label, Tokens: d.tokens, key: d.key }));
}

/**
 * Daily AI activity, reduced to the three fields the page actually plots.
 *
 * The cost is rounded to 2dp *here* rather than at the point of render so that
 * the KPI trend, the sparkline, and the donut all read the same rounded value.
 */
export function toActivitySeries(aiActivity: AiActivity[]) {
  return aiActivity.map((item) => ({
    cost: Number(item["Total Cost"].toFixed(2)),
    date: shortDate(item.date),
    tokens: item["Total Tokens"],
  }));
}

/**
 * Daily cache hit ratio, keyed for the area chart's `date`/`pct` axes.
 *
 * A `type`, not an `interface`, on purpose: `InsightAreaChart` takes
 * `Array<Record<string, string | number>>` and TypeScript only hands implicit
 * index signatures to object *type aliases*. Declaring this as an interface
 * makes the chart props unassignable.
 */
export type CacheRatioRow = {
  date: string;
  pct: number;
  tokens: number;
};

export function toCacheRatioSeries(
  cacheRatio: CacheRatioPoint[]
): CacheRatioRow[] {
  return cacheRatio.map((d) => ({
    date: shortDate(d.date),
    pct: d.pct,
    tokens: d.totalTokens,
  }));
}

/**
 * Page views for the KPI tile, preferring Cloudflare.
 *
 * `||` and not `??`: a 0 pageview count means the Cloudflare query failed or
 * was not configured, not that the site served nothing, so a zero falls through
 * to the PostHog total instead of rendering a truthful-looking "0".
 */
export function resolvePageViews(
  cloudflareTotal: number,
  posthogTotal: number
): number {
  return cloudflareTotal || posthogTotal;
}

/**
 * The "Last updated …" stamp under the page title.
 *
 * Returns null when Cloudflare never reported a generation time, which the
 * header renders as a plain "Last 30 days" instead. Note the timezone is left
 * to the runtime here, unlike `shortDate` which pins UTC: a calendar date that
 * drifts by one day across the two renders of a prerender is a real bug, and
 * the original page had the same behaviour.
 */
export function formatGeneratedAt(generatedAt: string): string | null {
  return generatedAt
    ? new Date(generatedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
}

/** One GitHub repo as the grid card needs it. */
export interface RepoCard {
  name: string;
  stars: number;
  language: string | null;
  license: string | null;
}

/**
 * The six repo cards plus the star total in the section's link.
 *
 * The star count sums *all* fetched repos, not just the six shown, so the
 * "N repos · M stars" link describes the account rather than the visible grid.
 */
export function toRepoCards(githubRepos: Repo[]): {
  repos: RepoCard[];
  totalStars: number;
} {
  // `stars` is passed through untouched: the card renders it verbatim, and a
  // `|| 0` here would silently replace a missing count with a real-looking 0.
  const cards = githubRepos.slice(0, 6).map((r) => ({
    name: r.name,
    stars: r.stars,
    language: r.language,
    license: r.license,
  }));
  const totalStars = githubRepos.reduce((sum, r) => sum + (r.stars || 0), 0);
  return { repos: cards, totalStars };
}

/**
 * The four sparkline series behind the KPI tiles.
 *
 * Each is a plain `Number(x) || 0` projection: a missing or non-numeric sample
 * becomes a 0 rather than a hole in the line. `costSpark` reads the already
 * rounded activity series so the sparkline and the tile's trend agree.
 */
export function buildSparklines(input: {
  wakaTrend: WakaTimeTrend[];
  traffic: Array<{ pageViews: number }>;
  aiActivity: ReturnType<typeof toActivitySeries>;
}): Record<"wakaSpark" | "viewsSpark" | "tokensSpark" | "costSpark", number[]> {
  return {
    wakaSpark: input.wakaTrend.map((t) => Number(t.hours) || 0),
    viewsSpark: input.traffic.map((t) => Number(t.pageViews) || 0),
    tokensSpark: input.aiActivity.map((a) => Number(a.tokens) || 0),
    costSpark: input.aiActivity.map((a) => Number(a.cost) || 0),
  };
}

/** The five most-read posts, ranked by the upstream PostHog order. */
export function topPosts(paths: PostHogPath[]): PostHogPath[] {
  return paths.slice(0, 5);
}

/** Top 5 models for the "where the tokens went" rows. */
export function topModels(aiModels: AiModel[]) {
  return aiModels.slice(0, 5).map((model) => ({
    name: compactName(model.name),
    pct: model.percent,
  }));
}

/** Top 5 languages for the "where the hours went" rows. */
export function topLanguages(wakaLanguages: WakaTimeLanguage[]) {
  return wakaLanguages.slice(0, 5).map((language) => ({
    name: language.name,
    pct: language.percent,
  }));
}

/** Top 6 projects by token volume for the leaderboard. */
export function topProjects(projectLeaderboard: ProjectLeaderboardEntry[]) {
  return projectLeaderboard.slice(0, 6).map((p) => ({
    name: p.name,
    pct: p.pct,
    tokens: p.tokens,
    cost: p.cost,
  }));
}

export interface KpiInput {
  wakaMetrics: WakaTimeMetrics;
  aiMetrics: AiMetrics;
  pageViews: number;
  wakaSpark: number[];
  viewsSpark: number[];
  tokensSpark: number[];
  costSpark: number[];
}

/** The four headline tiles across the top of the page. */
export function buildKpis(input: KpiInput): KpiTileData[] {
  const { wakaMetrics, aiMetrics, pageViews } = input;
  return [
    {
      k: "Coding hours",
      v: formatNumber(wakaMetrics.totalHours),
      unit: "h",
      sub: `${formatNumber(wakaMetrics.avgDailyHours)}h avg / active day`,
      trend: trendPct(input.wakaSpark),
      spark: input.wakaSpark,
    },
    {
      k: "Page views",
      v: formatCompact(pageViews),
      unit: "",
      sub: "Cloudflare · 30d",
      trend: trendPct(input.viewsSpark),
      spark: input.viewsSpark,
    },
    {
      k: "AI tokens",
      v: formatCompact(aiMetrics.totalTokens),
      unit: "",
      sub: `across ${aiMetrics.activeDays} active days`,
      trend: trendPct(input.tokensSpark),
      spark: input.tokensSpark,
    },
    {
      k: "AI spend",
      v: formatNumber(aiMetrics.totalCost),
      unit: "$",
      sub: `top: ${compactName(aiMetrics.topModel)}`,
      trend: trendPct(input.costSpark),
      good: true,
      spark: input.costSpark,
    },
  ];
}
