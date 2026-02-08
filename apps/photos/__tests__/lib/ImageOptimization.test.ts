import { test, expect, describe } from "bun:test";
import {
  getAspectRatioInfo,
  getOptimalImageSrc,
  generateBlurDataURL,
  getResponsiveSizes,
  shouldPrioritizeLoading,
} from "@/lib/ImageOptimization";

const mockPhoto = {
  id: "test-1",
  description: "Test photo",
  width: 1920,
  height: 1080,
  color: "#ff0000",
  urls: {
    raw: "https://example.com/raw.jpg",
    full: "https://example.com/full.jpg",
    regular: "https://example.com/regular.jpg",
    small: "https://example.com/small.jpg",
    thumb: "https://example.com/thumb.jpg",
  },
  created_at: "2024-01-01T00:00:00Z",
  provider: "unsplash" as const,
};

describe("ImageOptimization", () => {
  describe("getAspectRatioInfo", () => {
    test("identifies landscape orientation", () => {
      const result = getAspectRatioInfo(mockPhoto);
      expect(result.classification).toBe("landscape");
      expect(result.isLandscape).toBe(true);
      expect(result.ratio).toBeCloseTo(1.78, 2);
    });

    test("identifies portrait orientation", () => {
      const portraitPhoto = { ...mockPhoto, width: 1080, height: 1920 };
      const result = getAspectRatioInfo(portraitPhoto);
      expect(result.classification).toBe("portrait");
      expect(result.isPortrait).toBe(true);
    });

    test("identifies square orientation", () => {
      const squarePhoto = { ...mockPhoto, width: 1000, height: 1000 };
      const result = getAspectRatioInfo(squarePhoto);
      expect(result.classification).toBe("square");
      expect(result.isSquare).toBe(true);
    });
  });

  describe("getOptimalImageSrc", () => {
    test("returns raw URL for lightbox context", () => {
      const result = getOptimalImageSrc(mockPhoto, { context: "lightbox" });
      expect(result).toBe("https://example.com/raw.jpg");
    });

    test("returns small URL for preview context", () => {
      const result = getOptimalImageSrc(mockPhoto, { context: "preview" });
      expect(result).toBe("https://example.com/small.jpg");
    });

    test("returns regular URL for grid context by default", () => {
      const result = getOptimalImageSrc(mockPhoto, { context: "grid" });
      expect(result).toBe("https://example.com/regular.jpg");
    });

    test("returns regular URL for portrait photos with high DPR", () => {
      const portraitPhoto = { ...mockPhoto, width: 1080, height: 1920 };
      const result = getOptimalImageSrc(portraitPhoto, {
        context: "grid",
        devicePixelRatio: 3,
      });
      expect(result).toBe("https://example.com/regular.jpg");
    });
  });

  describe("generateBlurDataURL", () => {
    test("generates SVG blur placeholder with photo color", () => {
      const result = generateBlurDataURL(mockPhoto);
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(result).toContain("ZmYwMDAw"); // base64 encoded #ff0000
    });

    test("generates blur placeholder with default color when photo has no color", () => {
      const photoWithoutColor = { ...mockPhoto, color: undefined };
      const result = generateBlurDataURL(photoWithoutColor as any);
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(result).toContain("ZjNmNGY2"); // base64 encoded #f3f4f6 (default)
    });

    test("includes photo dimensions in SVG", () => {
      const result = generateBlurDataURL(mockPhoto);
      const decoded = atob(result.split(",")[1]);
      expect(decoded).toContain('width="1920"');
      expect(decoded).toContain('height="1080"');
    });
  });

  describe("getResponsiveSizes", () => {
    test("returns 100vw for lightbox", () => {
      const result = getResponsiveSizes("lightbox");
      expect(result).toBe("100vw");
    });

    test("returns responsive sizes for grid", () => {
      const result = getResponsiveSizes("grid");
      expect(result).toContain("100vw");
      expect(result).toContain("50vw");
      expect(result).toContain("33vw");
      expect(result).toContain("25vw");
    });
  });

  describe("shouldPrioritizeLoading", () => {
    test("returns true for first 6 images in grid", () => {
      expect(shouldPrioritizeLoading(0, "grid")).toBe(true);
      expect(shouldPrioritizeLoading(5, "grid")).toBe(true);
    });

    test("returns false for images after index 5 in grid", () => {
      expect(shouldPrioritizeLoading(6, "grid")).toBe(false);
      expect(shouldPrioritizeLoading(10, "grid")).toBe(false);
    });

    test("returns true for lightbox regardless of index", () => {
      expect(shouldPrioritizeLoading(0, "lightbox")).toBe(true);
      expect(shouldPrioritizeLoading(10, "lightbox")).toBe(true);
    });
  });
});
