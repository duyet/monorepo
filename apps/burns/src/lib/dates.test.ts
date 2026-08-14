import { describe, expect, test } from "vitest";
import { formatDay, parseDay } from "./dates";

describe("parseDay", () => {
  test("reads YYYY-MM-DD as a local calendar day", () => {
    const d = parseDay("2025-08-02");
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(2);
  });

  test.each([
    "2025-02-31",
    "2025-02-29",
    "2025-13-01",
    "2025-00-01",
    "2025-01-00",
    "2025-1-2",
    "2025-01",
    "2025-01-01-extra",
    "not-a-date",
    "",
  ])("rejects %s", (iso) => {
    expect(Number.isNaN(parseDay(iso).getTime())).toBe(true);
  });

  test("accepts a real leap day", () => {
    const d = parseDay("2024-02-29");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(29);
  });
});

describe("formatDay", () => {
  test("formats without shifting the calendar day", () => {
    expect(formatDay("2025-08-02", true)).toBe("2 Aug 2025");
    expect(formatDay("2025-08-02")).toBe("2 Aug");
  });
});
