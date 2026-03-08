import { describe, test, expect } from "bun:test";
import {
  getCategoryMetadata,
  getCategoryColorClass,
} from "../category-metadata";

describe("getCategoryMetadata", () => {
  test("returns object with required fields", () => {
    const meta = getCategoryMetadata("Engineering", 5, 0);
    expect(meta).toHaveProperty("description");
    expect(meta).toHaveProperty("color");
    expect(meta).toHaveProperty("illustration");
  });

  test("description includes category name (lowercase)", () => {
    const meta = getCategoryMetadata("Data Engineering", 0, 0);
    expect(meta.description.toLowerCase()).toContain("data engineering");
  });

  test("description with postCount > 0 includes count", () => {
    const meta = getCategoryMetadata("Rust", 3, 0);
    expect(meta.description).toContain("3");
    expect(meta.description).toContain("posts");
  });

  test("description with postCount = 1 uses singular 'post'", () => {
    const meta = getCategoryMetadata("Rust", 1, 0);
    expect(meta.description).toContain("1");
    expect(meta.description).toContain("post");
    expect(meta.description).not.toContain("posts");
  });

  test("description with postCount = 0 does not include count", () => {
    const meta = getCategoryMetadata("Go", 0, 0);
    expect(meta.description).not.toMatch(/\d+ posts/);
  });

  test("color rotates by index modulo rotation length", () => {
    const colors = [
      "cactus",
      "sage",
      "lavender",
      "oat",
      "ivory",
      "cream",
      "terracotta",
      "coral",
    ] as const;
    for (let i = 0; i < colors.length; i++) {
      const meta = getCategoryMetadata("Category", 0, i);
      expect(meta.color).toBe(colors[i]);
    }
    // Wraparound: index 8 === index 0
    const wrapped = getCategoryMetadata("Category", 0, colors.length);
    expect(wrapped.color).toBe(colors[0]);
  });

  test("illustration rotates by index modulo rotation length", () => {
    const illustrations = ["wavy", "geometric", "blob"] as const;
    for (let i = 0; i < illustrations.length; i++) {
      const meta = getCategoryMetadata("Category", 0, i);
      expect(meta.illustration).toBe(illustrations[i]);
    }
    // Wraparound
    const wrapped = getCategoryMetadata("Category", 0, illustrations.length);
    expect(wrapped.illustration).toBe(illustrations[0]);
  });

  test("defaults index to 0 when omitted", () => {
    const withDefault = getCategoryMetadata("Category", 0);
    const withZero = getCategoryMetadata("Category", 0, 0);
    expect(withDefault.color).toBe(withZero.color);
    expect(withDefault.illustration).toBe(withZero.illustration);
  });

  test("defaults postCount to 0 when omitted", () => {
    const withDefault = getCategoryMetadata("Category");
    const withZero = getCategoryMetadata("Category", 0, 0);
    expect(withDefault.description).toBe(withZero.description);
  });
});

describe("getCategoryColorClass", () => {
  test("returns light variant class by default", () => {
    expect(getCategoryColorClass("cactus")).toBe("bg-cactus-light");
    expect(getCategoryColorClass("sage")).toBe("bg-sage-light");
    expect(getCategoryColorClass("lavender")).toBe("bg-lavender-light");
  });

  test("returns light variant class when variant is 'light'", () => {
    expect(getCategoryColorClass("ivory", "light")).toBe("bg-ivory");
    expect(getCategoryColorClass("oat", "light")).toBe("bg-oat-light");
    expect(getCategoryColorClass("cream", "light")).toBe("bg-cream");
    expect(getCategoryColorClass("terracotta", "light")).toBe(
      "bg-terracotta-light"
    );
    expect(getCategoryColorClass("coral", "light")).toBe("bg-coral-light");
  });

  test("returns default variant class when variant is 'default'", () => {
    expect(getCategoryColorClass("ivory", "default")).toBe("bg-ivory-medium");
    expect(getCategoryColorClass("oat", "default")).toBe("bg-oat");
    expect(getCategoryColorClass("cream", "default")).toBe("bg-cream-warm");
    expect(getCategoryColorClass("cactus", "default")).toBe("bg-cactus");
    expect(getCategoryColorClass("sage", "default")).toBe("bg-sage");
    expect(getCategoryColorClass("lavender", "default")).toBe("bg-lavender");
    expect(getCategoryColorClass("terracotta", "default")).toBe(
      "bg-terracotta"
    );
    expect(getCategoryColorClass("coral", "default")).toBe("bg-coral");
  });
});
