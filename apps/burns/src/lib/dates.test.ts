import { describe, expect, test } from "vitest";
import { dataLabel, formatDay, parseDay, formatMonth } from "./dates";

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

describe("dataLabel", () => {
  test("puts the snapshot day right after the latest tracked day", () => {
    // A daily rebuild on the 4th whose data still ends on the 3rd has to be
    // readable at a glance, so the two days sit side by side.
    expect(
      dataLabel("2025-08-02", "2026-10-03", "2026-10-04T10:58:28.266Z")
    ).toBe("2 Aug 2025 — 3 Oct 2026 · Updated 4 Oct 2026");
  });

  test("reads the generation day in UTC, matching the snapshot", () => {
    // 23:00 UTC is still "4 Oct" for the label, no matter the build machine's
    // timezone — the snapshot's own clock is UTC.
    expect(
      dataLabel("2025-08-02", "2026-10-03", "2026-10-04T23:00:00.000Z")
    ).toContain("Updated 4 Oct 2026");
  });

  test("keeps the range when generatedAt is missing or invalid", () => {
    expect(dataLabel("2025-08-02", "2026-10-03", "")).toBe(
      "2 Aug 2025 — 3 Oct 2026"
    );
    expect(dataLabel("2025-08-02", "2026-10-03", "not-a-date")).toBe(
      "2 Aug 2025 — 3 Oct 2026"
    );
  });

  test("keeps Updated when the range is incomplete", () => {
    expect(dataLabel(null, null, "2026-10-04T10:58:28.266Z")).toBe(
      "Updated 4 Oct 2026"
    );
    expect(dataLabel("2025-08-02", null, "2026-10-04T10:58:28.266Z")).toBe(
      "Updated 4 Oct 2026"
    );
  });

  test("returns null when neither piece is known", () => {
    expect(dataLabel(null, null, "")).toBeNull();
    expect(dataLabel(null, null, "garbage")).toBeNull();
  });
});

describe("formatMonth", () => {
  test("labels a YYYY-MM(-DD) value with month and year", () => {
    expect(formatMonth("2026-08")).toBe("Aug 2026");
    expect(formatMonth("2026-08-15")).toBe("Aug 2026");
    expect(formatMonth("2025-01")).toBe("Jan 2025");
  });
});
