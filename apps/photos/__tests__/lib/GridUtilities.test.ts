import { test, expect, describe } from "bun:test";
import {
  getColumnsForViewport,
  getMasonryClasses,
  sortPhotos,
  filterPhotos,
  groupPhotosByYear,
  calculateGridItemDimensions,
  MASONRY_CONFIG,
  PRELOAD_CONFIG,
} from "@/lib/GridUtilities";

const mockPhotos = [
  {
    id: "1",
    width: 1920,
    height: 1080,
    created_at: "2024-01-01T00:00:00Z",
    urls: { raw: "", full: "", regular: "", small: "", thumb: "" },
    user: { id: "u1", username: "user1", name: "User 1" },
    stats: { views: 1000, downloads: 100 },
    likes: 50,
    location: { city: "SF", country: "USA" },
    exif: { make: "Canon", model: "5D" },
  },
  {
    id: "2",
    width: 1080,
    height: 1920,
    created_at: "2023-06-15T00:00:00Z",
    urls: { raw: "", full: "", regular: "", small: "", thumb: "" },
    user: { id: "u2", username: "user2", name: "User 2" },
    stats: { views: 500, downloads: 50 },
    likes: 25,
    location: { city: "NYC", country: "USA" },
    exif: { make: "Nikon", model: "D850" },
  },
  {
    id: "3",
    width: 1000,
    height: 1000,
    created_at: "2022-12-01T00:00:00Z",
    urls: { raw: "", full: "", regular: "", small: "", thumb: "" },
    user: { id: "u3", username: "user3", name: "User 3" },
    location: null,
    exif: null,
  },
];

describe("GridUtilities", () => {
  describe("getColumnsForViewport", () => {
    test("returns 1 column for mobile", () => {
      expect(getColumnsForViewport(600)).toBe(1);
    });

    test("returns 2 columns for tablet", () => {
      expect(getColumnsForViewport(800)).toBe(2);
    });

    test("returns 3 columns for desktop", () => {
      expect(getColumnsForViewport(1200)).toBe(3);
    });

    test("returns 4 columns for wide screens", () => {
      expect(getColumnsForViewport(1600)).toBe(4);
    });
  });

  describe("getMasonryClasses", () => {
    test("returns container and column classes", () => {
      const result = getMasonryClasses();
      expect(result.container).toBe("flex w-full gap-4");
      expect(result.column).toBe("bg-clip-padding");
    });
  });

  describe("sortPhotos", () => {
    test("sorts by date ascending", () => {
      const result = sortPhotos(mockPhotos, { by: "date", direction: "asc" });
      expect(result[0].id).toBe("3");
      expect(result[2].id).toBe("1");
    });

    test("sorts by date descending", () => {
      const result = sortPhotos(mockPhotos, { by: "date", direction: "desc" });
      expect(result[0].id).toBe("1");
      expect(result[2].id).toBe("3");
    });

    test("sorts by popularity", () => {
      const result = sortPhotos(mockPhotos, { by: "popularity", direction: "desc" });
      expect(result[0].id).toBe("1"); // 1000 views + 100 downloads + 50 likes
      expect(result[2].id).toBe("3"); // 0 views/downloads/likes
    });

    test("sorts by dimensions", () => {
      const result = sortPhotos(mockPhotos, { by: "dimensions", direction: "desc" });
      expect(result[0].id).toBe("1"); // 1920x1080 = 2,073,600 pixels
      expect(result[2].id).toBe("3"); // 1000x1000 = 1,000,000 pixels
    });
  });

  describe("filterPhotos", () => {
    test("filters by portrait aspect ratio", () => {
      const result = filterPhotos(mockPhotos, { aspectRatio: "portrait" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    test("filters by landscape aspect ratio", () => {
      const result = filterPhotos(mockPhotos, { aspectRatio: "landscape" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    test("filters by square aspect ratio", () => {
      const result = filterPhotos(mockPhotos, { aspectRatio: "square" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("3");
    });

    test("filters by year", () => {
      const result = filterPhotos(mockPhotos, { year: 2024 });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    test("filters by hasLocation", () => {
      const result = filterPhotos(mockPhotos, { hasLocation: true });
      expect(result).toHaveLength(2);
      expect(result.every((p) => p.location)).toBe(true);
    });

    test("filters by hasExif", () => {
      const result = filterPhotos(mockPhotos, { hasExif: true });
      expect(result).toHaveLength(2);
      expect(result.every((p) => p.exif)).toBe(true);
    });

    test("filters by minViews", () => {
      const result = filterPhotos(mockPhotos, { minViews: 750 });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    test("filters by photographer", () => {
      const result = filterPhotos(mockPhotos, { photographer: "user1" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("groupPhotosByYear", () => {
    test("groups photos by year", () => {
      const result = groupPhotosByYear(mockPhotos);
      expect(result["2024"]).toHaveLength(1);
      expect(result["2023"]).toHaveLength(1);
      expect(result["2022"]).toHaveLength(1);
    });
  });

  describe("calculateGridItemDimensions", () => {
    test("calculates dimensions for grid item", () => {
      const result = calculateGridItemDimensions(mockPhotos[0], 1200, 3);
      expect(result.width).toBeCloseTo(384, 0); // (1200 - 24*2) / 3
      expect(result.aspectRatio).toBeCloseTo(1.78, 2);
      expect(result.spanColumns).toBe(1);
    });
  });

  describe("MASONRY_CONFIG", () => {
    test("has correct breakpoints", () => {
      expect(MASONRY_CONFIG.breakpoints.default).toBe(4);
      expect(MASONRY_CONFIG.breakpoints["1280"]).toBe(3);
      expect(MASONRY_CONFIG.breakpoints["768"]).toBe(2);
      expect(MASONRY_CONFIG.breakpoints["640"]).toBe(1);
    });

    test("has gutter configuration", () => {
      expect(MASONRY_CONFIG.gutter.mobile).toBe("16px");
      expect(MASONRY_CONFIG.gutter.tablet).toBe("24px");
      expect(MASONRY_CONFIG.gutter.desktop).toBe("32px");
    });
  });

  describe("PRELOAD_CONFIG", () => {
    test("has priority count of 6", () => {
      expect(PRELOAD_CONFIG.priorityCount).toBe(6);
    });

    test("has intersection threshold", () => {
      expect(PRELOAD_CONFIG.intersectionThreshold).toBe(0.01);
    });

    test("has root margin for preloading", () => {
      expect(PRELOAD_CONFIG.rootMargin).toBe("200px");
    });
  });
});
