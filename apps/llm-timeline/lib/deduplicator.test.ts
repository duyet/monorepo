import { describe, expect, it } from "vitest";
import { formatMergeStats } from "./deduplicator";
import type { MergeStats } from "./types";

const stats: MergeStats = {
  sources: { curated: 2, epoch: 1 },
  duplicates: 1,
  total: 2,
};

describe("formatMergeStats", () => {
  it("returns the real summary lines for a small stats fixture", () => {
    expect(formatMergeStats(stats)).toBe(
      [
        "Merge Statistics:",
        "  curated: 2",
        "  epoch: 1",
        "  Duplicates removed: 1",
        "  Total unique models: 2",
      ].join("\n"),
    );
  });
});
