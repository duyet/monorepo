import { describe, expect, test } from "vitest";
import type { UnsplashPhoto } from "@/lib/types";
import { getPhotosByYear } from "@/lib/unsplash";

const photos = [
  { id: "a", created_at: "2026-06-01T12:00:00.000Z" },
  { id: "b", created_at: "2025-06-01T12:00:00.000Z" },
  { id: "c", created_at: "2026-01-15T12:00:00.000Z" },
] as UnsplashPhoto[];

describe("getPhotosByYear", () => {
  test("keeps only the photos whose created_at falls in that year", () => {
    expect(getPhotosByYear(photos, "2026").map((photo) => photo.id)).toEqual([
      "a",
      "c",
    ]);
  });
});
