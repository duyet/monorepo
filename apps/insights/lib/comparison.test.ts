import { describe, expect, it } from "vitest";
import { formatDelta, type ComparisonDelta } from "./comparison";

const up: ComparisonDelta = {
  value: 15,
  previousValue: 10,
  absoluteChange: 5,
  percentageChange: 50,
  trend: "up",
};

describe("formatDelta", () => {
  it("returns the signed change for a small up delta", () => {
    expect(formatDelta(up)).toBe("+5.0 (+50.0%)");
  });
});
