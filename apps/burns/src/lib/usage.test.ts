import { describe, expect, test } from "vitest";
import type { DailyEntry } from "./types";
import {
  buildSeries,
  byMonth,
  type Range,
  RANGES,
  seriesTotals,
  sliceRange,
  toColumns,
  toDays,
  topDays,
  visibleTokens,
  weekTrend,
} from "./usage";

function entry(date: string, by: Record<string, number>): DailyEntry {
  const sources = Object.entries(by).map(([source, tokens]) => ({
    source,
    total_tokens: tokens,
    cost: tokens / 1000,
  }));
  return {
    date,
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
    total_tokens: sources.reduce((a, s) => a + s.total_tokens, 0),
    cost: 0,
    by_source: sources,
  };
}

/** Newest-first, like `token-data.json`. */
const DAILY = [
  entry("2026-03-02", { "Claude Code": 3000, Codex: 1000 }),
  entry("2026-03-01", { "Claude Code": 2000 }),
  entry("2026-02-28", { Codex: 500 }),
];

const NAMES = Array.from({ length: 12 }, (_, i) => `agent-${i}`);

describe("buildSeries", () => {
  test("gives the top 10 their own colour and groups the rest as Other", () => {
    const series = buildSeries(NAMES);
    expect(series).toHaveLength(11);
    expect(series[0].color).toBe("var(--s0)");
    expect(series[9].color).toBe("var(--s9)");
    expect(series[10]).toMatchObject({
      key: "Other",
      color: "var(--other)",
      members: ["agent-10", "agent-11"],
    });
  });
});

describe("toDays", () => {
  test("puts the oldest day first", () => {
    expect(toDays(DAILY).map((d) => d.date)).toEqual([
      "2026-02-28",
      "2026-03-01",
      "2026-03-02",
    ]);
  });
});

describe("byMonth", () => {
  test("sums days into their calendar month, in order", () => {
    const months = byMonth(toDays(DAILY));
    expect(months.map((m) => m.date)).toEqual(["2026-02-01", "2026-03-01"]);
    expect(months[1].by["Claude Code"].tokens).toBe(5000);
  });
});

describe("toColumns", () => {
  const series = buildSeries(["Claude Code", "Codex"]);

  test("splits a day across series in series order", () => {
    const [, , last] = toColumns(toDays(DAILY), series, null);
    expect(last.tokens).toEqual([3000, 1000, 0]);
    expect(last.cost[0]).toBe(3);
  });

  test("a filter keeps only that agent, in its own slot", () => {
    const [first, , last] = toColumns(toDays(DAILY), series, "Codex");
    expect(first.tokens).toEqual([0, 500, 0]);
    expect(last.tokens).toEqual([0, 1000, 0]);
  });

  test("an agent outside the top 10 is drawn as Other", () => {
    const wide = buildSeries(NAMES);
    const days = toDays([entry("2026-03-01", { "agent-11": 7 })]);
    expect(toColumns(days, wide, null)[0].tokens[10]).toBe(7);
    // Filtering still draws it, as the Other slot.
    expect(toColumns(days, wide, "agent-11")[0].tokens[10]).toBe(7);
  });
});

describe("visibleTokens", () => {
  test("leaves out series the legend switched off", () => {
    const series = buildSeries(["Claude Code", "Codex"]);
    const [col] = toColumns(toDays([DAILY[0]]), series, null);
    expect(visibleTokens(col, series, new Set())).toBe(4000);
    expect(visibleTokens(col, series, new Set(["Claude Code"]))).toBe(1000);
  });
});

describe("seriesTotals", () => {
  test("sums each series across columns", () => {
    const series = buildSeries(["Claude Code", "Codex"]);
    expect(seriesTotals(toColumns(toDays(DAILY), series, null))).toEqual([
      5000, 1500, 0,
    ]);
  });
});

describe("sliceRange", () => {
  const days = toDays(DAILY);

  test("takes the newest days, since days run oldest first", () => {
    const range = RANGES.find((r) => r.key === "30d");
    if (!range) throw new Error("no 30d range");
    // A window wider than the data shows all of it.
    expect(sliceRange(days, range)).toHaveLength(3);
    expect(
      sliceRange(days, { ...range, days: 2 } as unknown as Range).map(
        (d) => d.date
      )
    ).toEqual(["2026-03-01", "2026-03-02"]);
  });

  test("the open range keeps everything", () => {
    expect(sliceRange(days, RANGES[0])).toHaveLength(3);
  });
});

describe("weekTrend", () => {
  test("compares the last 7 days with the 7 before", () => {
    const days = toDays(
      Array.from({ length: 14 }, (_, i) =>
        entry(`2026-03-${String(14 - i).padStart(2, "0")}`, {
          Codex: i < 7 ? 20 : 10,
        })
      )
    );
    expect(weekTrend(days)).toEqual({ last: 140, prior: 70 });
  });
});

describe("topDays", () => {
  test("ranks days by total tokens", () => {
    expect(topDays(toDays(DAILY), 2).map((d) => d.date)).toEqual([
      "2026-03-02",
      "2026-03-01",
    ]);
  });
});
