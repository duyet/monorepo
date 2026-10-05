import { describe, expect, test } from "vitest";
import { formatCompactMetadata } from "@/lib/MetadataFormatters";
import type { Photo } from "@/lib/types";

const photo = {
  id: "fixture",
  provider: "unsplash",
  created_at: "2026-03-04T12:00:00.000Z",
  width: 6000,
  height: 4000,
  urls: { full: "", regular: "", small: "", thumb: "" },
  stats: { views: 42, downloads: 7 },
  location: { city: "Hanoi", country: "Vietnam" },
  exif: { make: "Fujifilm", model: "X100V" },
} as Photo;

describe("formatCompactMetadata", () => {
  test("puts the date and counts on the card and the rest underneath", () => {
    expect(formatCompactMetadata(photo)).toEqual({
      primary: ["March 4, 2026", "👁 42", "⬇ 7"],
      secondary: ["6000 × 4000", "📍 Hanoi, Vietnam", "📷 Fujifilm X100V"],
    });
  });
});
