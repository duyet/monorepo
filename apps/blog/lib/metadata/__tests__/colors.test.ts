import { describe, test, expect } from "bun:test";
import { getColorClass, getRotatedColor } from "../colors";
import type { ColorVariant } from "../types";

const ALL_COLORS: ColorVariant[] = [
  "ivory",
  "oat",
  "cream",
  "cactus",
  "sage",
  "lavender",
  "terracotta",
  "coral",
];

describe("getColorClass", () => {
  test("returns light variant by default", () => {
    expect(getColorClass("cactus")).toBe("bg-cactus-light");
    expect(getColorClass("sage")).toBe("bg-sage-light");
    expect(getColorClass("lavender")).toBe("bg-lavender-light");
  });

  test("all colors return correct light class", () => {
    const expected: Record<ColorVariant, string> = {
      ivory: "bg-ivory",
      oat: "bg-oat-light",
      cream: "bg-cream",
      cactus: "bg-cactus-light",
      sage: "bg-sage-light",
      lavender: "bg-lavender-light",
      terracotta: "bg-terracotta-light",
      coral: "bg-coral-light",
    };
    for (const color of ALL_COLORS) {
      expect(getColorClass(color, "light")).toBe(expected[color]);
    }
  });

  test("all colors return correct default class", () => {
    const expected: Record<ColorVariant, string> = {
      ivory: "bg-ivory-medium",
      oat: "bg-oat",
      cream: "bg-cream-warm",
      cactus: "bg-cactus",
      sage: "bg-sage",
      lavender: "bg-lavender",
      terracotta: "bg-terracotta",
      coral: "bg-coral",
    };
    for (const color of ALL_COLORS) {
      expect(getColorClass(color, "default")).toBe(expected[color]);
    }
  });

  test("light and default variants return different classes", () => {
    for (const color of ALL_COLORS) {
      expect(getColorClass(color, "light")).not.toBe(
        getColorClass(color, "default")
      );
    }
  });
});

describe("getRotatedColor", () => {
  test("returns first color at index 0", () => {
    expect(getRotatedColor(ALL_COLORS, 0)).toBe("ivory");
  });

  test("returns correct color at each index", () => {
    for (let i = 0; i < ALL_COLORS.length; i++) {
      expect(getRotatedColor(ALL_COLORS, i)).toBe(ALL_COLORS[i]);
    }
  });

  test("wraps around with modulo at array length", () => {
    const len = ALL_COLORS.length;
    expect(getRotatedColor(ALL_COLORS, len)).toBe(ALL_COLORS[0]);
    expect(getRotatedColor(ALL_COLORS, len + 1)).toBe(ALL_COLORS[1]);
    expect(getRotatedColor(ALL_COLORS, len * 2)).toBe(ALL_COLORS[0]);
  });

  test("works with a subset of colors", () => {
    const subset: ColorVariant[] = ["sage", "coral"];
    expect(getRotatedColor(subset, 0)).toBe("sage");
    expect(getRotatedColor(subset, 1)).toBe("coral");
    expect(getRotatedColor(subset, 2)).toBe("sage");
    expect(getRotatedColor(subset, 3)).toBe("coral");
  });

  test("works with a single-element array", () => {
    const single: ColorVariant[] = ["lavender"];
    expect(getRotatedColor(single, 0)).toBe("lavender");
    expect(getRotatedColor(single, 5)).toBe("lavender");
    expect(getRotatedColor(single, 100)).toBe("lavender");
  });
});
