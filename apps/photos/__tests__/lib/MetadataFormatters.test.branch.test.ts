import { describe, expect, test } from "vitest";
import {
  formatExifSettings,
  formatPortfolioMetadata,
} from "@/lib/MetadataFormatters";
import type { Photo } from "@/lib/types";

const exifPhoto = {
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

const portfolioPhoto = {
  id: "p2",
  provider: "unsplash",
  created_at: "2024-06-15T12:00:00Z",
  width: 1000,
  height: 800,
  description: "Harbor",
  urls: { full: "", regular: "", small: "", thumb: "" },
  location: { city: "Hoi An", country: "Vietnam" },
  exif: {
    make: "Canon",
    model: "R5",
    aperture: "2.8",
    exposure_time: "1/250",
    iso: 100,
    focal_length: "50",
  },
} satisfies Photo;

describe("formatExifSettings", () => {
  test("joins the real aperture, shutter, ISO, and focal length", () => {
    expect(formatExifSettings(exifPhoto)).toBe(
      "f/1.8 • 1/200s • ISO 200 • 35mm"
    );
  });
});

describe("formatPortfolioMetadata", () => {
  test("returns the real title, date, and technical lines", () => {
    expect(formatPortfolioMetadata(portfolioPhoto)).toEqual({
      title: "Harbor",
      subtitle: "June 15, 2024",
      technical: [
        "1000 × 800",
        "Canon R5",
        "f/2.8 • 1/250s • ISO 100",
        "50mm",
      ],
      creative: ["Hoi An, Vietnam"],
    });
  });
});
