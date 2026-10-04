import { describe, expect, test } from "vitest";
import { extractPhotoDate } from "@/lib/exifExtractor";

describe("extractPhotoDate", () => {
  test("turns an EXIF timestamp into ISO and prefers the original over the file date", () => {
    expect(
      extractPhotoDate({
        dateTimeOriginal: "2026:03:04T12:00:00.000Z",
        dateTime: "2020:01:01T00:00:00.000Z",
      }),
    ).toBe("2026-03-04T12:00:00.000Z");
  });
});
