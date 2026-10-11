import { afterEach, describe, expect, test, vi } from "vitest";
import { setCachedPhotoData } from "@/lib/cache";

describe("setCachedPhotoData", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns undefined and stores the photo fixture", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-05T00:00:00.000Z"));

    const cache = { version: "1.0", entries: {} };
    const data = { id: "photo-1", likes: 4 };

    expect(setCachedPhotoData(cache, "photo-1", data)).toBeUndefined();
    expect(cache.entries["photo-1"]).toEqual({
      photoId: "photo-1",
      data,
      timestamp: Date.parse("2026-10-05T00:00:00.000Z"),
    });
  });
});
