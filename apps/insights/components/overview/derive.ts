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
import { compactName, formatCompact, formatNumber } from "./helpers";
import type {
  AiActivity,
  AiMetrics,
  AiModel,
  BucketedActivity,
  ProjectLeaderboardEntry,
  WakaTimeLanguage,
  WakaTimeMetrics,
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
