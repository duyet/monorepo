import { describe, expect, it } from "vitest";
import {
  DATE_RANGES,
  formatPercentage,
  formatSnapshotTime,
  getDateCondition,
} from "../lib/utils";

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

  it("formats the snapshot timestamp as UTC", () => {
    expect(formatSnapshotTime("2026-10-05T01:18:00.000Z")).toBe(
      "Oct 5, 2026, 01:18 UTC"
    );
    expect(formatSnapshotTime("not-a-date")).toBe("unknown");
  });

  it("formats percentage values", () => {
    expect(formatPercentage(0)).toBe("0%");
    expect(formatPercentage(12.34)).toBe("12.3%");
  });
});
