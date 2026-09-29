import { describe, expect, it } from "vitest";
import {
  extractWikilinks,
  normalizeRelatedRefs,
  stripWikilinkBrackets,
} from "./wikilinks";

describe("extractWikilinks", () => {
  it("extracts plain, anchored, and aliased targets, deduped", () => {
    const md = [
      "See [[project-anyrouter]] and [[project-anyrouter]] again.",
      "An anchored [[tech-clickhouse#rules]] link.",
      "An aliased [[project-kb|the kb repo]] link.",
    ].join("\n");
    expect(extractWikilinks(md)).toEqual([
      "project-anyrouter",
      "tech-clickhouse",
      "project-kb",
    ]);
  });

  it("trims whitespace and drops empty targets", () => {
    expect(extractWikilinks("[[  spaced  ]] and [[   ]]")).toEqual(["spaced"]);
  });

  it("returns nothing for a body with no wikilinks", () => {
    expect(extractWikilinks("plain markdown, no links here")).toEqual([]);
  });
});

describe("stripWikilinkBrackets", () => {
  it("strips only a surrounding bracket pair", () => {
    expect(stripWikilinkBrackets("[[project-kb]]")).toBe("project-kb");
    expect(stripWikilinkBrackets("project-kb")).toBe("project-kb");
    // Unbalanced brackets are left alone rather than half-stripped.
    expect(stripWikilinkBrackets("[[project-kb")).toBe("project-kb");
  });
});

describe("normalizeRelatedRefs", () => {
  it("normalizes a bracketed list", () => {
    expect(normalizeRelatedRefs(["[[a]]", "[[b]]"])).toEqual(["a", "b"]);
  });

  it("returns [] for a missing or non-list field", () => {
    expect(normalizeRelatedRefs(undefined)).toEqual([]);
    expect(normalizeRelatedRefs("[[a]]")).toEqual([]);
  });
});
