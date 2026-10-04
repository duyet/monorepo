import { describe, expect, test } from "vitest";
import { getEXIFOptions } from "@/lib/photo-provider";
import type { Photo } from "@/lib/types";

const photos = [
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
    expect(getEXIFOptions(photos)).toEqual({
      cameras: ["Fujifilm X100V", "Leica Q2"],
      focalLengths: [28, 35],
      isos: [100, 200],
      apertures: [1.7, 2],
    });
  });
});
