import { describe, test, expect } from "bun:test";
import { getWeekStart } from "../date-helpers";

describe("getWeekStart", () => {
  test("returns Sunday for a mid-week date (Wednesday)", () => {
    const date = new Date("2024-03-06T12:00:00");
    const result = getWeekStart(date);
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getDate()).toBe(3);
    expect(result.getMonth()).toBe(2); // March (0-indexed)
    expect(result.getFullYear()).toBe(2024);
  });

  test("returns the same date for a Sunday", () => {
    const date = new Date("2024-03-03T12:00:00");
    const result = getWeekStart(date);
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(3);
  });

  test("returns the previous Sunday for a Saturday", () => {
    const date = new Date("2024-03-09T12:00:00");
    const result = getWeekStart(date);
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(3);
  });

  test("handles month boundary (Monday at start of month)", () => {
    const date = new Date("2024-04-01T12:00:00");
    const result = getWeekStart(date);
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(31);
    expect(result.getMonth()).toBe(2); // March
    expect(result.getFullYear()).toBe(2024);
  });

  test("handles year boundary (Wednesday Jan 1 2025)", () => {
    const date = new Date("2025-01-01T12:00:00");
    const result = getWeekStart(date);
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(29);
    expect(result.getMonth()).toBe(11); // December (0-indexed)
    expect(result.getFullYear()).toBe(2024);
  });

  test("does not mutate the original date", () => {
    const date = new Date("2024-03-06T12:00:00");
    const originalTime = date.getTime();
    getWeekStart(date);
    expect(date.getTime()).toBe(originalTime);
  });
});
