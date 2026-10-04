import { describe, expect, test } from "vitest";
import { extractExifData } from "@/lib/exifExtractor";

describe("extractExifData", () => {
  test("returns undefined for a small buffer with no EXIF", () => {
    expect(extractExifData(Buffer.from([]))).toBeUndefined();
    expect(
      extractExifData(Buffer.from([0xff, 0xd8, 0xff, 0xd9])),
    ).toBeUndefined();
  });
});
