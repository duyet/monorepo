import { describe, expect, it } from "vitest";
import { idPrefixFromSlug, storyPath } from "./slug";

describe("storyPath", () => {
  it("uses lowercase category and the 8-char id prefix", () => {
    expect(storyPath({ id: "abcdef12deadbeef", category: "Industry" })).toBe(
      "/industry/abcdef12"
    );
  });

  it("falls back to /ai when category is missing", () => {
    expect(storyPath({ id: "abcdef12deadbeef", category: null })).toBe(
      "/ai/abcdef12"
    );
  });
});

describe("idPrefixFromSlug", () => {
  it("accepts a bare hex id", () => {
    expect(idPrefixFromSlug("abcdef12")).toBe("abcdef12");
  });

  it("accepts a legacy title-hash slug", () => {
    expect(idPrefixFromSlug("some-title-abcdef12")).toBe("abcdef12");
  });

  it("rejects non-hex slugs", () => {
    expect(idPrefixFromSlug("not-a-story")).toBeNull();
  });
});
