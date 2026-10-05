import { describe, expect, test } from "vitest";
import { getCacheStats } from "@/lib/cache";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

describe("getCacheStats", () => {
  test("counts fresh and expired entries in a small cache", () => {
    const now = Date.now();
    const stats = getCacheStats({
      version: "1.0",
      entries: {
        fresh: { photoId: "fresh", data: {}, timestamp: now },
        stale: {
          photoId: "stale",
          data: {},
          timestamp: now - WEEK_MS - 1000,
        },
      },
    });

    expect(stats).toEqual({
      totalEntries: 2,
      validEntries: 1,
      expiredEntries: 1,
    });
  });
});
