import { beforeEach, describe, expect, test, vi } from "vitest";
import { executeDuckDBQuery } from "../duckdb-cache";
import {
  getActivityByHour,
  getActivityByWeekday,
  getCacheRatioTrend,
} from "../insight-metrics";

vi.mock("../duckdb-cache", () => ({
  executeDuckDBQuery: vi.fn(),
}));

const query = vi.mocked(executeDuckDBQuery);

describe("getActivityByHour", () => {
  test("returns 24 zeroed hour buckets when the cache has no rows", async () => {
    query.mockResolvedValue([]);

    const buckets = await getActivityByHour(30);

    expect(buckets).toHaveLength(24);
    expect(buckets[0]).toEqual({
      label: "00:00",
      key: 0,
      tokens: 0,
      cost: 0,
      days: 0,
    });
    expect(buckets[23]).toEqual({
      label: "23:00",
      key: 23,
      tokens: 0,
      cost: 0,
      days: 0,
    });
    expect(buckets.every((b) => b.tokens === 0 && b.cost === 0)).toBe(true);
  });

  test("fills only the hours present in the rows", async () => {
    query.mockResolvedValue([
      { hour: 9, tokens: 1200, cost: 0.5 },
      { hour: 21, tokens: 800, cost: 0.25 },
    ]);

    const buckets = await getActivityByHour(30);

    expect(buckets[9]).toEqual({
      label: "09:00",
      key: 9,
      tokens: 1200,
      cost: 0.5,
      days: 0,
    });
    expect(buckets[21]).toEqual({
      label: "21:00",
      key: 21,
      tokens: 800,
      cost: 0.25,
      days: 0,
    });
    expect(buckets[8].tokens).toBe(0);
    expect(buckets[10].cost).toBe(0);
  });

  test("ignores rows whose hour falls outside 0–23", async () => {
    query.mockResolvedValue([
      { hour: 24, tokens: 999, cost: 9 },
      { hour: 5, tokens: 100, cost: 0.1 },
    ]);

    const buckets = await getActivityByHour(30);

    expect(buckets).toHaveLength(24);
    expect(buckets[5].tokens).toBe(100);
    expect(buckets.reduce((sum, b) => sum + b.tokens, 0)).toBe(100);
  });
});

describe("getActivityByWeekday", () => {
  test("maps a small weekday fixture to labels and numbers", async () => {
    query.mockResolvedValue([
      { dow: 0, tokens: "3", cost: 0, days: 1 },
      { dow: 1, tokens: 10, cost: 1.5, days: 2 },
    ]);

    const rows = await getActivityByWeekday(7);

    expect(rows).toEqual([
      { label: "Sun", key: 0, tokens: 3, cost: 0, days: 1 },
      { label: "Mon", key: 1, tokens: 10, cost: 1.5, days: 2 },
    ]);
  });
});

describe("getCacheRatioTrend", () => {
  beforeEach(() => {
    query.mockReset();
  });

  test("maps one cache row to its ratio point", async () => {
    query.mockResolvedValue([
      { date: "2026-01-02", total_tokens: 200, cache_tokens: 50 },
    ]);

    await expect(getCacheRatioTrend(7)).resolves.toEqual([
      {
        date: "2026-01-02",
        totalTokens: 200,
        cacheTokens: 50,
        pct: 25,
      },
    ]);
  });
});
