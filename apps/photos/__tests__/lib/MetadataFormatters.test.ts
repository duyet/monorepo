import { describe, expect, test } from "vitest";
import { formatExifSettings } from "@/lib/MetadataFormatters";
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
