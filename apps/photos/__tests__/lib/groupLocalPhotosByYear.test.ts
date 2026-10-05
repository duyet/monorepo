import { describe, expect, test } from "vitest";
import { groupLocalPhotosByYear } from "@/lib/localPhotos";
import type { LocalPhoto } from "@/lib/types";

function photo(id: string, created_at: string): LocalPhoto {
  return {
    id,
    source: "local",
    filename: `${id}.jpg`,
    originalName: `${id}.jpg`,
    created_at,
    updated_at: created_at,
    width: 100,
    height: 80,
    size: 10,
    mimeType: "image/jpeg",
    urls: {
      raw: `/photos/${id}.jpg`,
      full: `/photos/${id}.jpg`,
      regular: `/photos/${id}.jpg`,
      small: `/photos/${id}.jpg`,
      thumb: `/photos/${id}.jpg`,
    },
  };
}

describe("groupLocalPhotosByYear", () => {
  test("groups a small fixture by year, newest first inside the year", () => {
    const grouped = groupLocalPhotosByYear([
      photo("jan", "2024-01-10T12:00:00"),
      photo("older", "2023-11-01T12:00:00"),
      photo("mar", "2024-03-02T12:00:00"),
    ]);

    expect(Object.keys(grouped).sort()).toEqual(["2023", "2024"]);
    expect(grouped["2024"].map((item) => item.id)).toEqual(["mar", "jan"]);
    expect(grouped["2023"].map((item) => item.id)).toEqual(["older"]);
  });
});
