import type { LoaderData } from "./types";

export interface InsightSuggestion {
  id: string;
  title: string;
  body: string;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pctDelta(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** 2–4 actionable cards derived from already-loaded overview metrics. */
export function deriveSuggestions(data: LoaderData): InsightSuggestion[] {
  const out: InsightSuggestion[] = [];

  const hours = data.wakaTrend.map((row) => row.hours).filter(Number.isFinite);
  if (hours.length >= 4) {
    const mid = Math.floor(hours.length / 2);
    const delta = pctDelta(mean(hours.slice(mid)), mean(hours.slice(0, mid)));
    if (delta !== null && Math.abs(delta) >= 8) {
      const down = delta < 0;
      out.push({
        id: "coding-hours",
        title: down
          ? `Coding hours down ${Math.round(Math.abs(delta))}%`
          : `Coding hours up ${Math.round(delta)}%`,
        body: down
          ? "Second half of the WakaTime series is quieter than the first. Check if that matches time off or a tooling change."
          : "Recent months are busier than the earlier half of the series.",
      });
    }
  }

  const top = data.modelCostShare.slice().sort((a, b) => b.pct - a.pct)[0];
  if (top && top.pct >= 40) {
    out.push({
      id: "cost-driver",
      title: `${top.name} is ${Math.round(top.pct)}% of spend`,
      body: `Last 30 days this model dominates AI cost ($${top.cost.toFixed(2)}). Worth a cheaper default if quality allows.`,
    });
  }

  const costs = data.aiActivity
    .map((day) => day["Total Cost"] ?? 0)
    .filter(Number.isFinite);
  if (costs.length >= 8) {
    const mid = Math.floor(costs.length / 2);
    const delta = pctDelta(mean(costs.slice(mid)), mean(costs.slice(0, mid)));
    if (delta !== null && delta >= 20) {
      out.push({
        id: "spend-up",
        title: `Token spend up ${Math.round(delta)}% vs earlier half`,
        body: "Daily AI cost accelerated in the recent window. See billing below for the drivers.",
      });
    }
  }

  const cache = data.aiMetrics;
  if (cache.totalTokens > 0) {
    const rate = cache.cacheTokens / cache.totalTokens;
    if (rate < 0.2) {
      out.push({
        id: "cache-low",
        title: `Prompt cache hit rate is ${Math.round(rate * 100)}%`,
        body: "Cache tokens are a small share of volume. Repeated system prompts may be leaving money on the table.",
      });
    }
  }

  return out.slice(0, 4);
}

export interface BillingModelRow {
  name: string;
  cost: number;
  tokens: number;
  pct: number;
}

export interface BillingSummary {
  totalCost: number;
  dailyAverage: number;
  runRate30d: number;
  topDrivers: BillingModelRow[];
  daily: Array<{ date: string; cost: number; tokens: number }>;
}

export function deriveBilling(data: LoaderData): BillingSummary {
  const daily = data.aiActivity.map((day) => ({
    date: day.date,
    cost: day["Total Cost"] ?? 0,
    tokens: day["Total Tokens"] ?? 0,
  }));
  const totalCost =
    data.aiMetrics.totalCost ||
    daily.reduce((sum, day) => sum + day.cost, 0);
  const days = Math.max(1, data.aiMetrics.activeDays || daily.length || 1);
  const topDrivers = data.modelCostShare
    .slice()
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 6)
    .map((row) => ({
      name: row.name,
      cost: row.cost,
      tokens: row.tokens,
      pct: row.pct,
    }));
  return {
    totalCost,
    dailyAverage: totalCost / days,
    runRate30d: (totalCost / days) * 30,
    topDrivers,
    daily,
  };
}
