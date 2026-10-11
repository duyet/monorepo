import { describe, expect, it } from "vitest";
import { formatSyncTime } from "./sync-time";

describe("formatSyncTime", () => {
  it("keeps a date-only sync stamp as a date", () => {
    expect(formatSyncTime("2026-07-25")).toBe("25 Jul 2026");
  });

  it("shows the UTC clock time the sync script records", () => {
    expect(formatSyncTime("2026-10-05T06:00:12.000Z")).toBe(
      "5 Oct 2026, 06:00 UTC",
    );
  });

  it("returns an unparseable stamp unchanged", () => {
    expect(formatSyncTime("not-a-time")).toBe("not-a-time");
  });
});
