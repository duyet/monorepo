import { describe, expect, test } from "bun:test";
import {
  dateFormat,
  distanceFormat,
  distanceToNow,
  formatReadingTime,
  getReadingTime,
} from "./date";

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

describe("getReadingTime", () => {
  test("should calculate reading time for short content", () => {
    expect(getReadingTime(100)).toBe(1);
    expect(getReadingTime(150)).toBe(1);
  });

  test("should calculate reading time for longer content", () => {
    expect(getReadingTime(400)).toBe(2);
    expect(getReadingTime(800)).toBe(4);
  });

  test("should account for code blocks", () => {
    expect(getReadingTime(400, 2)).toBe(6); // 2 min prose + 4 min code = 6
    expect(getReadingTime(800, 5)).toBe(14); // 4 min prose + 10 min code = 14
  });

  test("should return minimum 1 minute", () => {
    expect(getReadingTime(0)).toBe(1);
    expect(getReadingTime(10)).toBe(1);
  });

  test("should handle zero words with code blocks", () => {
    expect(getReadingTime(0, 1)).toBe(2); // 0 prose + 2 min code
    expect(getReadingTime(0, 3)).toBe(6); // 0 prose + 6 min code
  });
});

describe("formatReadingTime", () => {
  test("should format minutes less than 60", () => {
    expect(formatReadingTime(1)).toBe("1 min read");
    expect(formatReadingTime(5)).toBe("5 min read");
    expect(formatReadingTime(30)).toBe("30 min read");
    expect(formatReadingTime(59)).toBe("59 min read");
  });

  test("should format exact hours", () => {
    expect(formatReadingTime(60)).toBe("1 hour read");
    expect(formatReadingTime(120)).toBe("2 hours read");
    expect(formatReadingTime(180)).toBe("3 hours read");
  });

  test("should format hours and minutes", () => {
    expect(formatReadingTime(61)).toBe("1 hour 1 min read");
    expect(formatReadingTime(75)).toBe("1 hour 15 min read");
    expect(formatReadingTime(90)).toBe("1 hour 30 min read");
    expect(formatReadingTime(150)).toBe("2 hours 30 min read");
  });
});
