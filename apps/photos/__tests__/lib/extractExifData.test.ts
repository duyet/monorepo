import { afterEach, describe, expect, test, vi } from "vitest";
import { extractExifData } from "@/lib/exifExtractor";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("extractExifData", () => {
  test("returns undefined for an empty buffer", () => {
    expect(extractExifData(Buffer.from([]))).toBeUndefined();
  });

  test("returns undefined for a parseable JPEG with no EXIF", () => {
    // extractExifData catches every exception and returns undefined, so the
    // assertion above also passes when wasm init or the parser throws. Spy on
    // console.error to tell the two apart.
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(
      extractExifData(Buffer.from([0xff, 0xd8, 0xff, 0xd9])),
    ).toBeUndefined();
    expect(error).not.toHaveBeenCalled();
  });
});