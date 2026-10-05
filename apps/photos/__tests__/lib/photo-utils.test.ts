import { describe, expect, test } from "vitest";
import { getPhotosByYear } from "@/lib/photo-utils";
import type { Photo } from "@/lib/types";

const photo = (id: string, created_at: string): Photo => ({
  id,
  provider: "unsplash",
  created_at,
  width: 1000,
  height: 800,
  urls: { full: "", regular: "", small: "", thumb: "" },
});

const photos = [
  photo("p2023", "2023-06-15T12:00:00Z"),
  photo("p2024a", "2024-03-01T12:00:00Z"),
  photo("p2024b", "2024-11-20T12:00:00Z"),
];

describe("getPhotosByYear", () => {
  test("returns only photos created in the given year, in input order", () => {
    expect(getPhotosByYear(photos, "2024")).toEqual([photos[1], photos[2]]);
    expect(getPhotosByYear(photos, "2023")).toEqual([photos[0]]);
  });

  test("returns an empty array when no photo matches", () => {
    expect(getPhotosByYear(photos, "2020")).toEqual([]);
  });

  test("groups unparseable created_at under the NaN year", () => {
    const broken = photo("bad", "not-a-date");
    expect(getPhotosByYear([broken], "NaN")).toEqual([broken]);
    expect(getPhotosByYear([broken], "2024")).toEqual([]);
  });
});
