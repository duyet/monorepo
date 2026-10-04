import { describe, expect, test } from "vitest";
import { formatPortfolioMetadata } from "@/lib/MetadataFormatters";
import type { Photo } from "@/lib/types";

const photo = {
  id: "p1",
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

describe("formatPortfolioMetadata", () => {
  test("returns the real title, date, and technical lines", () => {
    expect(formatPortfolioMetadata(photo)).toEqual({
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
