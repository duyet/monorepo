import { describe, expect, test } from "vitest";
import { getPeriodDates } from "../comparison";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("getPeriodDates", () => {
  test("returns a day-count window ending now", () => {
    const before = Date.now();
    const { start, end } = getPeriodDates(30);
    const after = Date.now();

    expect(end.getTime()).toBeGreaterThanOrEqual(before);
    expect(end.getTime()).toBeLessThanOrEqual(after);
    const span = end.getTime() - start.getTime();
    expect(span).toBeGreaterThanOrEqual(30 * DAY_MS);
    expect(span).toBeLessThan(30 * DAY_MS + 5000);
  });

  test("starts at 2020-01-01 for 'all'", () => {
    const { start, end } = getPeriodDates("all");

    expect(start).toEqual(new Date(2020, 0, 1));
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });
});
