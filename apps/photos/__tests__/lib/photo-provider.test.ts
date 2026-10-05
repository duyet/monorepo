import { describe, expect, test } from "vitest";
import { filterByEXIF, getEXIFOptions } from "@/lib/photo-provider";
import type { Photo } from "@/lib/types";

function photo(id: string, exif?: Photo["exif"]): Photo {
  return {
    id,
    provider: "unsplash",
    created_at: "2024-01-01T00:00:00Z",
    width: 1000,
    height: 800,
    urls: { full: "", regular: "", small: "", thumb: "" },
    exif,
  };
}

const PHOTOS: Photo[] = [
  photo("canon", {
    make: "Canon",
    model: "EOS R5",
    iso: 200,
    aperture: "f/2.8",
    focal_length: "50",
  }),
  photo("sony", { name: "Sony A7 IV" }),
  photo("no-exif"),
];

const ids = (photos: Photo[]) => photos.map((p) => p.id);

const exifOptionPhotos = [
  {
    exif: {
      make: "Fujifilm",
      model: "X100V",
      focal_length: "35",
      iso: 200,
      aperture: "f/2",
    },
  },
  {
    exif: {
      name: "Leica Q2",
      focal_length: "28",
      iso: 100,
      aperture: "1.7",
    },
  },
  {},
] as Photo[];

describe("getEXIFOptions", () => {
  test("collects sorted cameras and exposure values, skipping photos without exif", () => {
    expect(getEXIFOptions(exifOptionPhotos)).toEqual({
      cameras: ["Fujifilm X100V", "Leica Q2"],
      focalLengths: [28, 35],
      isos: [100, 200],
      apertures: [1.7, 2],
    });
  });
});

describe("filterByEXIF", () => {
  test("drops photos without EXIF even with no filters", () => {
    expect(ids(filterByEXIF(PHOTOS, {}))).toEqual(["canon", "sony"]);
  });

  test("matches the camera name or make+model, case-insensitively", () => {
    expect(ids(filterByEXIF(PHOTOS, { camera: "canon" }))).toEqual(["canon"]);
    expect(ids(filterByEXIF(PHOTOS, { camera: "a7" }))).toEqual(["sony"]);
  });

  test("excludes only out-of-range values; missing fields are kept", () => {
    // canon iso=200 is below [800, 6400]; sony has no iso and is kept.
    expect(ids(filterByEXIF(PHOTOS, { iso: [800, 6400] }))).toEqual(["sony"]);
    // canon aperture f/2.8 parses to 2.8, outside [1, 2]; sony kept.
    expect(ids(filterByEXIF(PHOTOS, { aperture: [1, 2] }))).toEqual(["sony"]);
    // canon focal 50 in [40, 85]; sony has none and is kept.
    expect(ids(filterByEXIF(PHOTOS, { focalLength: [40, 85] }))).toEqual([
      "canon",
      "sony",
    ]);
  });
});
