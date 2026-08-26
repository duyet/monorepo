import { describe, expect, it } from "vitest";
import { DATE_RANGES, formatPercentage, getDateCondition } from "../lib/utils";

describe("ai-percentage utils", () => {
  it("defines the supported date ranges", () => {
    expect(DATE_RANGES.map((range) => range.value)).toEqual([
      "30d",
      "90d",
      "6m",
      "1y",
      "all",
    ]);
  });

  it("builds ClickHouse date filters", () => {
    expect(getDateCondition(30)).toContain("INTERVAL 30 DAY");
    expect(getDateCondition("all")).toBe("");
  });

  it("formats percentage values", () => {
    expect(formatPercentage(0)).toBe("0%");
    expect(formatPercentage(12.34)).toBe("12.3%");
  });
});
