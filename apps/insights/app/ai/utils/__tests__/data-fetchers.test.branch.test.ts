import { describe, expect, test, vi } from "vitest";

const executeClickHouseQuery = vi.fn();
const executeDuckDBQuery = vi.fn();

vi.mock("../database", () => ({
  executeClickHouseQuery: (...args: unknown[]) =>
    executeClickHouseQuery(...args),
  testClickHouseConnection: vi.fn(),
}));

vi.mock("../duckdb-cache", () => ({
  executeDuckDBQuery: (...args: unknown[]) => executeDuckDBQuery(...args),
}));

const { getCCUsageActivity } = await import("../data-fetchers");

const clickHouseRow = {
  date: "2026-01-01",
  "Total Tokens": 1500,
  "Input Tokens": 1000,
  "Output Tokens": 400,
  "Cache Tokens": 100,
  "Total Cost": 0.5,
};

describe("getCCUsageActivity", () => {
  test("maps query rows into thousand-token chart data", async () => {
    executeClickHouseQuery.mockResolvedValue({
      success: true,
      data: [clickHouseRow],
    });
    executeDuckDBQuery.mockResolvedValue([]);

    expect(await getCCUsageActivity(30)).toEqual([
      {
        date: "2026-01-01",
        "Total Tokens": 2,
        "Input Tokens": 1,
        "Output Tokens": 0,
        "Cache Tokens": 0,
        "Total Cost": 0.5,
      },
    ]);
  });

  test("maps DuckDB cache rows when ClickHouse returns nothing", async () => {
    executeClickHouseQuery.mockResolvedValue({ success: false, data: [] });
    executeDuckDBQuery.mockResolvedValue([clickHouseRow]);

    const result = await getCCUsageActivity(30);
    expect(result[0]?.["Total Tokens"]).toBe(2);
    expect(result[0]?.["Total Cost"]).toBe(0.5);
  });

  test("returns an empty array when both sources are empty", async () => {
    executeClickHouseQuery.mockResolvedValue({ success: false, data: [] });
    executeDuckDBQuery.mockResolvedValue([]);

    expect(await getCCUsageActivity(30)).toEqual([]);
  });
});
