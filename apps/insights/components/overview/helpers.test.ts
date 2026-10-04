import { describe, expect, it } from "vitest";
import { formatSnapshotTime } from "./helpers";

describe("formatSnapshotTime", () => {
  it("shows the UTC date and clock time of a baked payload stamp", () => {
    expect(formatSnapshotTime("2026-10-05T14:32:08.000Z")).toBe(
      "5 Oct 2026, 14:32 UTC",
    );
  });

  it("returns null when the payload has no usable stamp", () => {
    expect(formatSnapshotTime("")).toBeNull();
    expect(formatSnapshotTime(null)).toBeNull();
    expect(formatSnapshotTime(undefined)).toBeNull();
    expect(formatSnapshotTime("not-a-date")).toBeNull();
  });
});
