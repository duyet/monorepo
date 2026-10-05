import { beforeEach, describe, expect, it, vi } from "vitest";

const mockQuery = vi.fn();

vi.mock("../duckdb-cache", () => ({
  executeDuckDBQuery: (...args: unknown[]) => mockQuery(...args),
}));

describe("getActivityByWeekday", () => {
  beforeEach(() => {
    vi.resetModules();
    mockQuery.mockReset();
  });

  it("maps a small weekday fixture to labels and numbers", async () => {
    mockQuery.mockResolvedValue([
      { dow: 0, tokens: "3", cost: 0, days: 1 },
      { dow: 1, tokens: 10, cost: 1.5, days: 2 },
    ]);

    const { getActivityByWeekday } = await import("../insight-metrics");
    const rows = await getActivityByWeekday(7);

    expect(rows).toEqual([
      { label: "Sun", key: 0, tokens: 3, cost: 0, days: 1 },
      { label: "Mon", key: 1, tokens: 10, cost: 1.5, days: 2 },
    ]);
  });
});
