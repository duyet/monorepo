import { describe, expect, test } from "vitest";
import {
  formatExifSettings,
  formatFeedCaption,
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

describe("formatFeedCaption", () => {
  const feed = { ...photo, created_at: "2024-06-15T12:00:00Z" };

  test("prefers the description", () => {
    expect(
      formatFeedCaption({
        ...feed,
        description: "Mist over the valley",
        alt_description: "A misty valley",
      }),
    ).toBe("Mist over the valley");
  });

  test("falls back to the alt description", () => {
    expect(
      formatFeedCaption({
        ...feed,
        description: null,
        alt_description: "A misty valley",
      }),
    ).toBe("A misty valley");
  });

  test("joins location and date when no description exists", () => {
    expect(
      formatFeedCaption({
        ...feed,
        description: null,
        alt_description: null,
        location: { city: "Da Lat", country: "Vietnam" },
      }),
    ).toBe("Da Lat, Vietnam • June 15, 2024");
  });

  test("uses the date alone as the last resort", () => {
    expect(
      formatFeedCaption({ ...feed, description: null, alt_description: null }),
    ).toBe("June 15, 2024");
  });
});
