import { describe, expect, test } from "vitest";
import { getCachedPhotoData } from "@/lib/cache";

const cache = {
  version: "1.0",
  entries: {
    fresh: {
      photoId: "fresh",
      data: { id: "fresh", description: "A cached photo" },
      timestamp: Date.now(),
    },
    stale: {
      photoId: "stale",
      data: { id: "stale" },
      timestamp: 0,
    },
  },
};

describe("getCachedPhotoData", () => {
  test("returns null for a missing entry", () => {
    expect(getCachedPhotoData(cache, "missing")).toBeNull();
  });

  test("returns fresh data unexpired", () => {
    const result = getCachedPhotoData(cache, "fresh");
    expect(result?.isExpired).toBe(false);
    expect(result?.data).toEqual({
      id: "fresh",
      description: "A cached photo",
    });
    expect(result?.age).toBeGreaterThanOrEqual(0);
  });

  test("marks old entries as expired", () => {
    expect(getCachedPhotoData(cache, "stale")?.isExpired).toBe(true);
  });
});
