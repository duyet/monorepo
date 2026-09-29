import { describe, expect, test } from "vitest";
import {
  clickHouseDateTime,
  clickHouseNow,
  daysBefore,
  daysBetween,
  isoDate,
  isoDateOf,
} from "../clickhouse/format";

/**
 * These helpers replaced inline expressions spread across the syncers. Each
 * test pins the helper to the exact expression it replaced so a future edit
 * cannot silently change a value written to ClickHouse.
 */
describe("clickhouse/format", () => {
  test("clickHouseDateTime matches the inline slice(0, 19).replace('T', ' ')", () => {
    const iso = "2026-05-25T20:30:45.123Z";
    expect(clickHouseDateTime(iso)).toBe(iso.slice(0, 19).replace("T", " "));
    expect(clickHouseDateTime(iso)).toBe("2026-05-25 20:30:45");
  });

  test("clickHouseDateTime truncates sub-second precision for DateTime64(3)", () => {
    expect(clickHouseDateTime("2025-11-30T17:07:21.999Z")).toBe(
      "2025-11-30 17:07:21"
    );
  });

  test("clickHouseNow matches new Date().toISOString().slice(0, 19).replace('T', ' ')", () => {
    const expected = new Date().toISOString().slice(0, 19).replace("T", " ");
    expect(clickHouseNow()).toBe(expected);
  });

  test("isoDate matches the inline split('T')[0]", () => {
    const iso = "2026-05-25T20:30:45Z";
    expect(isoDate(iso)).toBe(iso.split("T")[0]);
    expect(isoDate(iso)).toBe("2026-05-25");
  });

  test("isoDateOf matches the inline date.toISOString().split('T')[0]", () => {
    const date = new Date("2026-05-25T20:30:45.000Z");
    expect(isoDateOf(date)).toBe(date.toISOString().split("T")[0]);
    expect(isoDateOf(date)).toBe("2026-05-25");
  });

  test("isoDateOf uses the UTC day, matching the replaced expressions", () => {
    // 23:30 UTC on the 25th is already the 26th in +02:00 local time.
    expect(isoDateOf(new Date("2026-05-25T23:30:00Z"))).toBe("2026-05-25");
  });

  test("daysBetween matches the inline Math.floor delta over 24 * 60 * 60 * 1000", () => {
    const start = new Date("2026-05-01T00:00:00Z");
    const end = new Date("2026-05-31T12:00:00Z");
    const inline = Math.floor(
      (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    );
    expect(daysBetween(start, end)).toBe(inline);
    expect(daysBetween(start, end)).toBe(30);
  });

  test("daysBetween floors partial days", () => {
    const start = new Date("2026-05-01T00:00:00Z");
    const end = new Date("2026-05-01T23:59:59Z");
    expect(daysBetween(start, end)).toBe(0);
  });

  test("daysBetween is negative when the range is inverted", () => {
    const start = new Date("2026-05-31T00:00:00Z");
    const end = new Date("2026-05-01T00:00:00Z");
    expect(daysBetween(start, end)).toBe(-30);
  });

  test("daysBefore matches the inline new Date(ref - days * MS_PER_DAY)", () => {
    const reference = new Date("2026-05-31T12:00:00Z");
    for (const days of [7, 30, 90, 365]) {
      const inline = new Date(reference.getTime() - days * 24 * 60 * 60 * 1000);
      expect(daysBefore(reference, days)).toEqual(inline);
    }
  });
});
