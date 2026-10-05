import { describe, expect, test } from "vitest";
import { dayTotals, rangeScope, stackedTokens, summarizePeriod } from "./period";
import type { DailyEntry } from "./types";

/** Newest-first, matching what `scripts/fetch-burns-data.ts` writes. */
function day(
  date: string,
  total: number,
  bySource: Record<string, [number, number]>,
  extra: Partial<DailyEntry> = {}
): DailyEntry {
  return {
    date,
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
    total_tokens: total,
    cost: 0,
    by_source: Object.entries(bySource).map(([source, [t, c]]) => ({
      source,
      total_tokens: t,
      cost: c,
    })),
    ...extra,
  };
}

const DAILY: DailyEntry[] = [
  day("2026-03-03", 30, { Codex: [30, 3] }, { input_tokens: 10, cost: 3 }),
  day("2026-03-02", 20, { Codex: [10, 1], gemini: [10, 2] }, {
    input_tokens: 5,
    output_tokens: 15,
    cost: 3,
  }),
  day("2026-03-01", 10, { "claude-code": [10, 5] }, { cost: 5 }),
];

describe("stackedTokens", () => {
  test("sums the painted stack when it disagrees with total_tokens", () => {
    const fixture = day("2026-03-04", 99, { Codex: [12, 1], gemini: [8, 1] });
    expect(stackedTokens(fixture)).toBe(20);
  });

  test("falls back to total_tokens when the stack is empty", () => {
    const fixture = day("2026-03-04", 42, {});
    fixture.by_source = [];
    expect(stackedTokens(fixture)).toBe(42);
  });
});

describe("summarizePeriod", () => {
  test("slices the newest days, since daily is newest-first", () => {
    expect(summarizePeriod(DAILY, 1).totalTokens).toBe(30);
    expect(summarizePeriod(DAILY, 2).totalTokens).toBe(50);
    expect(summarizePeriod(DAILY, null).totalTokens).toBe(60);
  });

  test("counts a partial window as it is, without padding", () => {
    const period = summarizePeriod(DAILY, 99);
    expect(period.entries).toBe(3);
    expect(period.totalTokens).toBe(60);
  });

  test("merges raw source names before totalling", () => {
    const period = summarizePeriod(DAILY, null);
    expect(period.bySource.map((s) => s.source)).toEqual([
      "Codex",
      "Gemini CLI",
      "Claude Code",
    ]);
    expect(period.bySource[0]).toEqual({
      source: "Codex",
      total_tokens: 40,
      cost: 4,
    });
  });

  test("narrows tokens, cost and sources to one agent", () => {
    const period = summarizePeriod(DAILY, null, "Codex");
    expect(period.totalTokens).toBe(40);
    expect(period.totalCost).toBe(4);
    expect(period.bySource).toEqual([
      { source: "Codex", total_tokens: 40, cost: 4 },
    ]);
  });

  test("omits the mix under a filter, since the day fields are not per agent", () => {
    expect(summarizePeriod(DAILY, null).mix).toEqual({
      input_tokens: 15,
      output_tokens: 15,
      cache_creation_tokens: 0,
      cache_read_tokens: 0,
      total_tokens: 60,
      total_cost: 11,
    });
    expect(summarizePeriod(DAILY, null, "Codex").mix).toBeNull();
  });

  test("falls back to total_tokens for a day with no by_source", () => {
    const bare: DailyEntry[] = [{ ...day("2026-03-01", 42, {}) }];
    bare[0].by_source = [];
    expect(summarizePeriod(bare, null).totalTokens).toBe(42);
    expect(summarizePeriod(bare, null).bySource).toEqual([]);
  });

  test("reports zeroes for an empty window rather than throwing", () => {
    const period = summarizePeriod([], null);
    expect(period).toMatchObject({
      totalTokens: 0,
      totalCost: 0,
      bySource: [],
      entries: 0,
    });
    expect(period.mix?.total_tokens).toBe(0);
  });
});

describe("dayTotals", () => {
  test("returns the painted stack and the day's cost", () => {
    expect(dayTotals(DAILY[1])).toEqual({ tokens: 20, cost: 3 });
  });

  test("narrows tokens and cost to one agent", () => {
    expect(dayTotals(DAILY[1], "Gemini CLI")).toEqual({ tokens: 10, cost: 2 });
  });
});

describe("rangeScope", () => {
  test("reads as a period, not as the button label", () => {
    expect(rangeScope({ label: "All", days: null })).toBe("All-time");
    expect(rangeScope({ label: "90 days", days: 90 })).toBe("Last 90 days");
    expect(rangeScope({ label: "12 months", days: 365 })).toBe(
      "Last 12 months"
    );
  });
});