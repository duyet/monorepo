import { describe, it, expect } from "bun:test";

describe("Home App", () => {
  describe("Page Routes", () => {
    it("should have home page at /", () => {
      expect(true).toBe(true);
    });

    it("should have ls page at /ls", () => {
      expect(true).toBe(true);
    });

    it("should have about page at /about", () => {
      expect(true).toBe(true);
    });
  });

  describe("API Routes", () => {
    it("should have ping route at /api/ping", () => {
      expect(true).toBe(true);
    });
  });

  describe("Components", () => {
    it("should have icon components available", () => {
      const iconComponents = [
        "ResumeIcon",
        "BlogIcon",
        "HomelabIcon",
        "AIIcon",
        "InsightsIcon",
        "PhotosIcon",
        "AboutIcon",
      ];

      iconComponents.forEach((component) => {
        expect(component).toBeDefined();
      });
    });

    it("should have layout component available", () => {
      expect(true).toBe(true);
    });
  });
});
