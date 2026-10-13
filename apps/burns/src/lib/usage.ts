import { normalizeSource } from "./sources";
import type { DailyEntry } from "./types";

/** Agents drawn as their own colour; the rest share "Other". */
export const TOP_SERIES = 10;
export const OTHER_KEY = "Other";

export const VIEWS = [
  { key: "monthly", label: "Monthly" },
  { key: "daily", label: "Daily" },
] as const;

export type View = (typeof VIEWS)[number]["key"];

export const RANGES = [
  { key: "all", label: "All", days: null, scope: "all time" },
  { key: "12m", label: "12m", days: 365, scope: "last 12 months" },
  { key: "90d", label: "90d", days: 90, scope: "last 90 days" },
  { key: "30d", label: "30d", days: 30, scope: "last 30 days" },
] as const;

export type Range = (typeof RANGES)[number];
export type RangeKey = Range["key"];

/** One stacked colour: a top agent, or the "Other" bucket. */
export interface Series {
  key: string;
  label: string;
  /** CSS colour, a theme token. */
  color: string;
  /** Agents drawn in this colour. */
  members: readonly string[];
}

/** `order` is agents by all-time tokens, largest first. */
export function buildSeries(order: readonly string[]): Series[] {
  const top = order.slice(0, TOP_SERIES);
  return [
    ...top.map((name, i) => ({
      key: name,
      label: name,
      color: `var(--s${i})`,
      members: [name],
    })),
    {
      key: OTHER_KEY,
      label: OTHER_KEY,
      color: "var(--other)",
      members: order.slice(TOP_SERIES),
    },
  ];
}

/** Index of the series an agent is drawn in. */
export function seriesIndex(series: readonly Series[], agent: string): number {
  const at = series.findIndex((s) => s.key === agent);
  return at === -1 ? series.length - 1 : at;
}

export interface Usage {
  tokens: number;
  cost: number;
}

/** One calendar day (or month), usage per agent display name. */
export interface Day {
  date: string;
  by: Record<string, Usage>;
}

function add(into: Record<string, Usage>, agent: string, u: Usage): void {
  const cur = into[agent];
  if (cur) {
    cur.tokens += u.tokens;
    cur.cost += u.cost;
    return;
  }
  into[agent] = { ...u };
}

/** Oldest first. `daily` is newest-first (see `scripts/fetch-burns-data.ts`). */
export function toDays(daily: readonly DailyEntry[]): Day[] {
  return daily
    .map((entry) => {
      const by: Record<string, Usage> = {};
      for (const s of entry.by_source ?? []) {
        add(by, normalizeSource(s.source), {
          tokens: s.total_tokens,
          cost: s.cost,
        });
      }
      return { date: entry.date, by };
    })
    .reverse();
}

/** Roll days up into one entry per calendar month, keeping order. */
export function byMonth(days: readonly Day[]): Day[] {
  const months = new Map<string, Day>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    let month = months.get(key);
    if (!month) {
      month = { date: `${key}-01`, by: {} };
      months.set(key, month);
    }
    for (const [agent, u] of Object.entries(day.by)) add(month.by, agent, u);
  }
  return [...months.values()];
}

export function dayTotal(day: Day): Usage {
  return Object.values(day.by).reduce(
    (acc, u) => ({ tokens: acc.tokens + u.tokens, cost: acc.cost + u.cost }),
    { tokens: 0, cost: 0 }
  );
}

/** A bar's data: one value per series, in series order. */
export interface Column {
  date: string;
  tokens: number[];
  cost: number[];
}

/** With `filter`, only that agent is drawn, in its own series slot. */
export function toColumns(
  days: readonly Day[],
  series: readonly Series[],
  filter: string | null
): Column[] {
  return days.map((day) => {
    const tokens = series.map(() => 0);
    const cost = series.map(() => 0);
    for (const [agent, u] of Object.entries(day.by)) {
      if (filter !== null && agent !== filter) continue;
      const i = seriesIndex(series, agent);
      tokens[i] += u.tokens;
      cost[i] += u.cost;
    }
    return { date: day.date, tokens, cost };
  });
}

/** The newest `range.days` days, or everything for the open range. */
export function sliceRange<T>(days: readonly T[], range: Range): T[] {
  return range.days === null ? [...days] : days.slice(-range.days);
}

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

/** Tokens drawn in a bar, leaving out series the legend has switched off. */
export function visibleTokens(
  column: Column,
  series: readonly Series[],
  hidden: ReadonlySet<string>
): number {
  return sum(column.tokens.filter((_, i) => !hidden.has(series[i].key)));
}

export function columnTotal(column: Column): Usage {
  return { tokens: sum(column.tokens), cost: sum(column.cost) };
}

/** Tokens per series across the columns, in series order. */
export function seriesTotals(columns: readonly Column[]): number[] {
  const first = columns[0]?.tokens.length ?? 0;
  return Array.from({ length: first }, (_, i) =>
    sum(columns.map((c) => c.tokens[i]))
  );
}

/** Last 7 days against the 7 before, over all agents. */
export function weekTrend(days: readonly Day[]): {
  last: number;
  prior: number;
} {
  const tokens = (slice: readonly Day[]) =>
    sum(slice.map((d) => dayTotal(d).tokens));
  return {
    last: tokens(days.slice(-7)),
    prior: tokens(days.slice(-14, -7)),
  };
}

/** The agent with the most tokens in a day, or null for an empty day. */
export function leadAgent(day: Day): string | null {
  let lead: string | null = null;
  let best = -1;
  for (const [agent, u] of Object.entries(day.by)) {
    if (u.tokens > best) {
      best = u.tokens;
      lead = agent;
    }
  }
  return lead;
}

/** Busiest days first. */
export function topDays(days: readonly Day[], count: number): Day[] {
  return [...days]
    .sort((a, b) => dayTotal(b).tokens - dayTotal(a).tokens)
    .slice(0, count);
}
