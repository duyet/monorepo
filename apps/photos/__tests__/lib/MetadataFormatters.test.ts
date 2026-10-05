import { describe, expect, test } from "vitest";
import {
  formatCompactMetadata,
  formatExifSettings,
  formatFeedCaption,
  formatPhotoDescription,
  formatPhotoMetadata,
  formatPortfolioMetadata,
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

const compactPhoto = {
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

describe("formatExifSettings", () => {
  test("joins the real aperture, shutter, ISO, and focal length", () => {
    expect(formatExifSettings(photo)).toBe("f/1.8 • 1/200s • ISO 200 • 35mm");
  });
});

describe("formatFeedCaption", () => {
  const feed = { ...photo, created_at: "2024-06-15T12:00:00Z" };

  test("prefers the description", () => {
    expect(
      formatFeedCaption({
        ...feed,
        description: "Mist over the valley",
        alt_description: "A misty valley",
      })
    ).toBe("Mist over the valley");
  });

  test("falls back to the alt description", () => {
    expect(
      formatFeedCaption({
        ...feed,
        description: null,
        alt_description: "A misty valley",
      })
    ).toBe("A misty valley");
  });

  test("joins location and date when no description exists", () => {
    expect(
      formatFeedCaption({
        ...feed,
        description: null,
        alt_description: null,
        location: { city: "Da Lat", country: "Vietnam" },
      })
    ).toBe("Da Lat, Vietnam • June 15, 2024");
  });

  test("uses the date alone as the last resort", () => {
    expect(
      formatFeedCaption({ ...feed, description: null, alt_description: null })
    ).toBe("June 15, 2024");
  });
});

describe("formatCompactMetadata", () => {
  test("puts the date and counts on the card and the rest underneath", () => {
    expect(formatCompactMetadata(compactPhoto)).toEqual({
      primary: ["March 4, 2026", "👁 42", "⬇ 7"],
      secondary: ["6000 × 4000", "📍 Hanoi, Vietnam", "📷 Fujifilm X100V"],
    });
  });
});

describe("formatPhotoMetadata", () => {
  test("returns the date, dimensions, and location for a small fixture", () => {
    expect(
      formatPhotoMetadata({
        ...photo,
        created_at: "2024-06-15T12:00:00.000Z",
        location: { city: "Hanoi", country: "Vietnam" },
      })
    ).toEqual({
      dateFormatted: "June 15, 2024",
      dimensions: "1000 × 800",
      location: "Hanoi, Vietnam",
    });
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

describe("formatPortfolioMetadata", () => {
  test("returns the real title, date, and technical lines", () => {
    expect(formatPortfolioMetadata(portfolioPhoto)).toEqual({
      title: "Harbor",
      subtitle: "June 15, 2024",
      technical: ["1000 × 800", "Canon R5", "f/2.8 • 1/250s • ISO 100", "50mm"],
      creative: ["Hoi An, Vietnam"],
    });
  });
});
