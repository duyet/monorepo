import { beforeEach, describe, expect, it, vi } from "vitest";

const mockClickHouse = vi.fn();

vi.mock("../database", () => ({
  executeClickHouseQuery: (...args: unknown[]) => mockClickHouse(...args),
}));

vi.mock("../duckdb-cache", () => ({
  executeDuckDBQuery: vi.fn(async () => []),
}));

describe("getCCUsageMetrics", () => {
  beforeEach(() => {
    vi.resetModules();
    mockClickHouse.mockReset();
  });

  it("maps a small usage fixture to overview metrics", async () => {
    mockClickHouse
      .mockResolvedValueOnce({
        success: true,
        data: [
          {
            total_tokens: 100,
            cache_tokens: 30,
            total_cost: 1.25,
            active_days: 4,
          },
        ],
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{ model_name: "claude-sonnet", total_tokens: 80 }],
      });

    const { getCCUsageMetrics } = await import("../data-fetchers");
    const metrics = await getCCUsageMetrics(7);

    expect(metrics).toEqual({
      totalTokens: 100,
      dailyAverage: 25,
      activeDays: 4,
      cacheTokens: 30,
      totalCost: 1.25,
      topModel: "claude-sonnet",
    });
  });
});
