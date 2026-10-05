import { describe, expect, test } from "vitest";
import {
  formatExifSettings,
  formatPhotoDescription,
} from "@/lib/MetadataFormatters";
import type { Photo } from "@/lib/types";

const photo = {
  id: "p1",
  provider: "unsplash",
  created_at: "2024-01-01T00:00:00Z",
  width: 1000,
  height: 800,
  urls: { full: "", regular: "", small: "", thumb: "" },
  exif: {
    aperture: "1.8",
    exposure_time: "1/200",
    iso: 200,
    focal_length: "35",
  },
} satisfies Photo;

describe("formatExifSettings", () => {
  test("joins the real aperture, shutter, ISO, and focal length", () => {
    expect(formatExifSettings(photo)).toBe("f/1.8 • 1/200s • ISO 200 • 35mm");
  });
});

describe("formatPhotoDescription", () => {
  test("prefers description over alt_description", () => {
    expect(
      formatPhotoDescription({
        ...photo,
        description: "Golden hour over the bay",
        alt_description: "sunset",
      })
    ).toBe("Golden hour over the bay");
  });

  test("falls back to alt_description", () => {
    expect(
      formatPhotoDescription({ ...photo, alt_description: "a red door" })
    ).toBe("a red door");
  });

  test("treats an empty description as missing", () => {
    expect(
      formatPhotoDescription({
        ...photo,
        description: "",
        alt_description: "a red door",
      })
    ).toBe("a red door");
  });

  test("falls back to Photograph id with the photographer name", () => {
    expect(
      formatPhotoDescription({ ...photo, user: { name: "Duyet Le" } })
    ).toBe("Photograph p1 by Duyet Le");
  });

  test("falls back to Photograph id alone without a user", () => {
    expect(formatPhotoDescription(photo)).toBe("Photograph p1");
  });
});
