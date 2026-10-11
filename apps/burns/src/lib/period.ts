import { normalizeSource } from "./sources";
import type { DailyEntry, SourceTotal, TokenTotals } from "./types";

/**
 * Period totals for the chart's selected range.
 *
 * These numbers have to match what the bars draw, so both read the same
 * helpers here. A filtered bar sums only that agent's `by_source` slice, and
 * an unfiltered bar sums the stack rather than the day's own `total_tokens`,
 * because the stack is what gets painted. Reading `total_tokens` directly
 * would disagree with the chart the moment the two ever differ.
 *
 * `daily` is newest-first (see `scripts/fetch-burns-data.ts`), so the window is
 * a head slice, not a tail slice.
 */
export function stackedTokens(day: DailyEntry): number {
  const sum = (day.by_source ?? []).reduce((acc, s) => acc + s.total_tokens, 0);
  return sum || day.total_tokens;
}

/** Tokens and cost for one day, narrowed to `filter` when one is selected. */
export function dayTotals(
  day: DailyEntry,
  filter: string | null = null
): { tokens: number; cost: number } {
  if (filter === null) return { tokens: stackedTokens(day), cost: day.cost };
  return (day.by_source ?? [])
    .filter((s) => normalizeSource(s.source) === filter)
    .reduce(
      (acc, s) => ({
        tokens: acc.tokens + s.total_tokens,
        cost: acc.cost + s.cost,
      }),
      { tokens: 0, cost: 0 }
    );
}

export interface PeriodSummary {
  /** Tokens in the window, after any source filter. */
  totalTokens: number;
  /** Cost in the window, after any source filter. */
  totalCost: number;
  /** Per-agent totals, merged and sorted by the caller for display. */
  bySource: SourceTotal[];
  /**
   * Token mix for the window, or null when a source filter is active. The
   * per-day mix fields are not split by agent, so there is no honest mix to
   * show for one agent — a zero-filled mix would read as "no cache reads".
   */
  mix: TokenTotals | null;
  /** Daily entries in the window. */
  entries: number;
}

export function summarizePeriod(
  daily: readonly DailyEntry[],
  days: number | null,
  filter: string | null = null
): PeriodSummary {
  const window = days === null ? daily : daily.slice(0, days);

  const bySource = new Map<string, SourceTotal>();
  const mix: TokenTotals = {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
    total_tokens: 0,
    total_cost: 0,
  };
  let totalTokens = 0;
  let totalCost = 0;

  for (const day of window) {
    const { tokens, cost } = dayTotals(day, filter);
    totalTokens += tokens;
    totalCost += cost;

    if (filter === null) {
      mix.input_tokens += day.input_tokens;
      mix.output_tokens += day.output_tokens;
      mix.cache_creation_tokens += day.cache_creation_tokens;
      mix.cache_read_tokens += day.cache_read_tokens;
    }

    for (const s of day.by_source ?? []) {
      const source = normalizeSource(s.source);
      if (filter !== null && source !== filter) continue;
      const existing = bySource.get(source);
      if (existing) {
        existing.total_tokens += s.total_tokens;
        existing.cost += s.cost;
        continue;
      }
      bySource.set(source, { source, total_tokens: s.total_tokens, cost: s.cost });
    }
  }

  mix.total_tokens = totalTokens;
  mix.total_cost = totalCost;

  return {
    totalTokens,
    totalCost,
    bySource: [...bySource.values()].sort((a, b) => b.total_tokens - a.total_tokens),
    mix: filter === null ? mix : null,
    entries: window.length,
  };
}

/**
 * Scope caption for the breakdown dialog, e.g. "All-time" or "Last 90 days".
 * The range button already says "All", which reads wrong as a period.
 */
export function rangeScope(range: {
  label: string;
  days: number | null;
}): string {
  if (range.days === null) return "All-time";
  return `Last ${range.label.toLowerCase()}`;
}