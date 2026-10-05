import { describe, expect, test } from "vitest";
import { cleanExpiredCache } from "@/lib/cache";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("cleanExpiredCache", () => {
  test("drops entries older than the 7-day TTL and reports the count", () => {
    const cache = {
      version: "1.0",
      entries: {
        fresh: {
          photoId: "fresh",
          data: {},
          timestamp: Date.now(),
        },
        stale: {
          photoId: "stale",
          data: {},
          timestamp: Date.now() - 8 * DAY_MS,
        },
        ancient: {
          photoId: "ancient",
          data: {},
          timestamp: 0,
        },
      },
    };

    expect(cleanExpiredCache(cache)).toBe(2);
    expect(Object.keys(cache.entries)).toEqual(["fresh"]);
  });

  test("keeps every entry when nothing has expired", () => {
    const cache = {
      version: "1.0",
      entries: {
        fresh: {
          photoId: "fresh",
          data: {},
          timestamp: Date.now(),
        },
      },
    };

    expect(cleanExpiredCache(cache)).toBe(0);
    expect(cache.entries.fresh).toBeDefined();
  });
});
