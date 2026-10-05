import { describe, expect, it } from "vitest";
import { compactName, formatSnapshotTime, formatCompact } from "./helpers";

describe("compactName", () => {
  it("strips the claude- prefix and spaces out hyphens", () => {
    expect(compactName("claude-sonnet-4-5")).toBe("sonnet 4 5");
    expect(compactName("gemini-2.5-pro")).toBe("gemini 2.5 pro");
  });

  it("keeps gpt- as a readable prefix and truncates at 24 chars", () => {
    expect(compactName("gpt-4o-mini")).toBe("gpt 4o mini");
    expect(compactName("claude-opus-4-20250514-something")).toBe(
      "opus 4 20250514 somethin",
    );
  });
});

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

describe("formatCompact", () => {
  it("returns the compact en-US form of a small fixture", () => {
    expect(formatCompact(0)).toBe("0");
    expect(formatCompact(1500)).toBe("1.5K");
  });
});
