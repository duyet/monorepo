import { describe, expect, test, vi } from "vitest";

// `executeDuckDBQuery` shells out to `bun` to read the cache file. A runner
// without bun on PATH gets [] back, so the real DuckDB fixture made this test
// pass locally and fail in CI. Mock the transport and feed it the rows the
// query returns: what is under test is the cost-share arithmetic.
vi.mock("../duckdb-cache", () => ({
  executeDuckDBQuery: vi.fn(async () => [
    { name: "alpha", cost: 3, tokens: 10 },
    { name: "beta", cost: 1, tokens: 4 },
  ]),
}));

describe("getModelCostShare", () => {
  test("returns each model's cost share for the fixture", async () => {
    const { getModelCostShare } = await import("../insight-metrics");

    await expect(getModelCostShare("all")).resolves.toEqual([
      { name: "alpha", cost: 3, tokens: 10, pct: 75 },
      { name: "beta", cost: 1, tokens: 4, pct: 25 },
    ]);
  });
});