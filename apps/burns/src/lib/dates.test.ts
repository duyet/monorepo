import { describe, expect, test } from "vitest";
import { formatDay, parseDay } from "./dates";

describe("parseDay", () => {
  test("reads YYYY-MM-DD as a local calendar day", () => {
    const d = parseDay("2025-08-02");
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(2);
  });
});

describe("formatDay", () => {
  test("formats without shifting the calendar day", () => {
    expect(formatDay("2025-08-02", true)).toContain("2025");
    expect(formatDay("2025-08-02")).not.toMatch(/31|1 Aug|Jul/);
  });
});
