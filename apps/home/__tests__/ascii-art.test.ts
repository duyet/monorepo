import { describe, expect, it } from "vitest";
import { ASCII_ART, artFor, SHOWCASE_LANDSCAPE } from "../src/data/ascii-art";

describe("artFor", () => {
  it("maps a seed to a stable ASCII art path", () => {
    expect(artFor("a")).toBe("/art/ascii-01.webp");
    expect(artFor("b")).toBe("/art/ascii-02.webp");
    expect(artFor("duyet")).toBe("/art/ascii-03.webp");
  });

  it("returns the first art for an empty seed", () => {
    expect(artFor("")).toBe("/art/ascii-01.webp");
  });

  it("shifts the selection by offset, wrapping around the art list", () => {
    expect(artFor("a", 3)).toBe("/art/ascii-04.webp");
    expect(artFor("b", 20)).toBe("/art/ascii-02.webp");
  });

  it("always returns a member of ASCII_ART", () => {
    for (const seed of ["", "a", "AnyRouter", "duyet", "x".repeat(256)]) {
      expect(ASCII_ART).toContain(artFor(seed));
    }
  });

  it("pins the showcase landscape to the AnyRouter seed", () => {
    expect(SHOWCASE_LANDSCAPE).toBe("/art/ascii-10.webp");
    expect(SHOWCASE_LANDSCAPE).toBe(artFor("AnyRouter", 0));
  });
});
