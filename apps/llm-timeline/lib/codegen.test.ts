import { describe, expect, it } from "vitest";
import { generateDataTs } from "./codegen";
import type { MergeStats } from "./types";

const stats: MergeStats = {
  sources: { curated: 1 },
  duplicates: 0,
  total: 1,
};

describe("generateDataTs sync stamp", () => {
  it("writes the full sync timestamp and a date for lastmod", () => {
    const output = generateDataTs(
      [],
      [],
      "2026-10-05T06:00:12.000Z",
      stats,
    );

    expect(output).toContain("export const syncedAt = '2026-10-05T06:00:12.000Z'");
    expect(output).toContain("export const lastSynced = '2026-10-05'");
  });
});
