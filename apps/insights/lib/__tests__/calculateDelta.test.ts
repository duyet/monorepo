import { describe, expect, test } from "vitest";
import { calculateDelta } from "../comparison";

describe("calculateDelta", () => {
  test("returns the change from 100 to 150", () => {
    expect(calculateDelta(150, 100)).toEqual({
      value: 150,
      previousValue: 100,
      absoluteChange: 50,
      percentageChange: 50,
      trend: "up",
    });
  });
});
