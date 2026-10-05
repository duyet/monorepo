import { describe, expect, test, vi } from "vitest";

// `executeDuckDBQuery` shells out to `bun` to read the cache file. A runner
// without bun on PATH gets [] back, so the real DuckDB fixture made this test
// pass locally and fail in CI. Mock both transports and feed the DuckDB one the
// rows the query returns: what is under test is the share arithmetic.
vi.mock("../duckdb-cache", () => ({
  executeDuckDBQuery: vi.fn(async () => [
    { model_name: "alpha", total_cost: 3, total_tokens: 10, usage_count: 1 },
    { model_name: "beta", total_cost: 1, total_tokens: 4, usage_count: 1 },
  ]),
}));

vi.mock("../database", () => ({
  // No rows, so executeAnalyticsQuery falls through to the DuckDB cache.
  executeClickHouseQuery: vi.fn(async () => ({ success: true, data: [] })),
  testClickHouseConnection: vi.fn(async () => ({
    success: true,
    message: "",
    details: {},
  })),
}));

describe("getCCUsageModels", () => {
  test("returns token and cost shares for the fixture", async () => {
    const { getCCUsageModels } = await import("../data-fetchers");

    await expect(getCCUsageModels("all")).resolves.toEqual([
      {
        name: "alpha",
        tokens: 10,
        cost: 3,
        percent: 71,
        costPercent: 75,
        usageCount: 1,
      },
      {
        name: "beta",
        tokens: 4,
        cost: 1,
        percent: 29,
        costPercent: 25,
        usageCount: 1,
      },
    ]);
  });
});