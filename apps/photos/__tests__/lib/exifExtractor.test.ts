import { describe, expect, test } from "vitest";
import { formatGPSCoordinates } from "@/lib/exifExtractor";

describe("formatGPSCoordinates", () => {
  test("formats a northern-eastern fix to six decimals", () => {
    expect(formatGPSCoordinates(16.047079, 108.20623)).toBe(
      "16.047079° N, 108.206230° E",
    );
  });

  test("flips the hemisphere letters for southern-western fixes", () => {
    expect(formatGPSCoordinates(-33.8688, 151.2093)).toBe(
      "33.868800° S, 151.209300° E",
    );
    expect(formatGPSCoordinates(-0.5, -0.25)).toBe(
      "0.500000° S, 0.250000° W",
    );
  });

  test("treats the equator and prime meridian as N and E", () => {
    expect(formatGPSCoordinates(0, 0)).toBe("0.000000° N, 0.000000° E");
  });
});
