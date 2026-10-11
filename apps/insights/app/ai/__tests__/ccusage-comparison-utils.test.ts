import { describe, expect, test, vi } from "vitest";

vi.mock("../utils", () => ({
  getCCUsageMetrics: vi.fn(async (days: number | "all") => {
    if (days === 7) {
      return {
        totalTokens: 200,
        totalCost: 4,
        activeDays: 2,
        topModel: "opus",
      };
    }
    if (days === 30) {
      return {
        totalTokens: 100,
        totalCost: 2,
        activeDays: 1,
        topModel: "sonnet",
      };
    }
    return null;
  }),
}));

import { getCCUsageComparison } from "../ccusage-comparison-utils";

describe("getCCUsageComparison", () => {
  test("returns deltas from the two period metrics", async () => {
    await expect(getCCUsageComparison(7, 30)).resolves.toEqual({
      totalTokens: {
        value1: 200,
        value2: 100,
        delta: {
          value: 200,
          previousValue: 100,
          absoluteChange: 100,
          percentageChange: 100,
          trend: "up",
        },
      },
      totalCost: {
        value1: 4,
        value2: 2,
        delta: {
          value: 4,
          previousValue: 2,
          absoluteChange: 2,
          percentageChange: 100,
          trend: "up",
        },
      },
      activeDays: {
        value1: 2,
        value2: 1,
        delta: {
          value: 2,
          previousValue: 1,
          absoluteChange: 1,
          percentageChange: 100,
          trend: "up",
        },
      },
      topModel: { value1: "opus", value2: "sonnet" },
    });
  });

  test("returns null when either period has no metrics", async () => {
    await expect(getCCUsageComparison(1, 30)).resolves.toBeNull();
  });
});
