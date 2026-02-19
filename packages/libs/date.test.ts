import { describe, expect, test } from "bun:test";
import { dateFormat, distanceFormat, distanceToNow } from "./date";

describe("distanceToNow", () => {
  test("should format future date with suffix", () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow
    const result = distanceToNow(futureDate);
    expect(result).toMatch(/^in (1 day|24 hours)$/);
  });

  test("should format past date with suffix", () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
    const result = distanceToNow(pastDate);
    expect(result).toMatch(/^(1 day|24 hours) ago$/);
  });

  test("should handle numeric timestamp", () => {
    const timestamp = Date.now() - 60 * 60 * 1000; // 1 hour ago
    expect(distanceToNow(timestamp)).toBe("1 hour ago");
  });
});

describe("distanceFormat", () => {
  test("should format distance between two dates", () => {
    const date1 = new Date("2024-01-01");
    const date2 = new Date("2024-01-02");
    expect(distanceFormat(date1, date2)).toBe("1 day");
  });

  test("should format longer time periods", () => {
    const date1 = new Date("2024-01-01");
    const date2 = new Date("2024-02-01");
    expect(distanceFormat(date1, date2)).toBe("about 1 month");
  });

  test("should handle same dates", () => {
    const date = new Date("2024-01-01");
    expect(distanceFormat(date, date)).toBe("less than a minute");
  });
});

describe("dateFormat", () => {
  test("should format date with yyyy-MM-dd pattern", () => {
    const date = new Date("2024-03-15");
    expect(dateFormat(date, "yyyy-MM-dd")).toBe("2024-03-15");
  });

  test("should format date with dd/MM/yyyy pattern", () => {
    const date = new Date("2024-03-15");
    expect(dateFormat(date, "dd/MM/yyyy")).toBe("15/03/2024");
  });

  test("should format date with time using HH:mm pattern", () => {
    const date = new Date("2024-03-15T14:30:00");
    expect(dateFormat(date, "HH:mm")).toBe("14:30");
  });

  test("should format full date and time", () => {
    const date = new Date("2024-03-15T14:30:00");
    expect(dateFormat(date, "yyyy-MM-dd HH:mm:ss")).toBe("2024-03-15 14:30:00");
  });

  test("should format with custom text pattern", () => {
    const date = new Date("2024-03-15");
    expect(dateFormat(date, "MMMM do, yyyy")).toBe("March 15th, 2024");
  });
});
