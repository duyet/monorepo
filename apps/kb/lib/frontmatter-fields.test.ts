import { describe, expect, it } from "vitest";
import { type Frontmatter, fmString, fmStringList } from "./frontmatter-fields";

// These two accessors were duplicated verbatim in `lib/content.ts` and
// `scripts/generate-static-files.ts`, justified by a comment claiming the two
// callers "must disagree". They cannot: the one field that must disagree
// (`type` → `memoryType`) is decided at the call site, not here. These tests
// pin the shared behaviour so a future edit to one copy cannot silently diverge
// from the other again.

describe("fmString", () => {
  it("returns the value when it is a string", () => {
    expect(fmString({ title: "Hello" }, "title", "fallback")).toBe("Hello");
  });

  it("returns the fallback when the key is absent", () => {
    expect(fmString({}, "title", "fallback")).toBe("fallback");
  });

  it("returns the fallback for every non-string type, including falsy-looking ones", () => {
    const nonStrings: unknown[] = [
      42,
      0,
      true,
      false,
      null,
      undefined,
      ["a"],
      { a: 1 },
    ];
    for (const value of nonStrings) {
      const data = { title: value } as Frontmatter;
      expect(fmString(data, "title", "fallback")).toBe("fallback");
    }
  });

  it("returns the fallback for a non-string instead of coercing it", () => {
    // A numeric `updated: 20260812` must not become the string "20260812" —
    // the sitemap emits it verbatim inside <lastmod>.
    expect(fmString({ updated: 20260812 }, "updated", "")).toBe("");
  });

  it("treats an empty string as present, not missing", () => {
    expect(fmString({ summary: "" }, "summary", "fallback")).toBe("");
  });
});

describe("fmStringList", () => {
  it("returns the list when it is an array", () => {
    expect(fmStringList({ tags: ["a", "b"] }, "tags")).toEqual(["a", "b"]);
  });

  it("returns [] when the key is absent", () => {
    expect(fmStringList({}, "tags")).toEqual([]);
  });

  it("returns [] for every non-array type, including strings", () => {
    const notLists: unknown[] = ["a,b", "a", 42, null, { a: 1 }];
    for (const value of notLists) {
      const data = { tags: value } as Frontmatter;
      expect(fmStringList(data, "tags")).toEqual([]);
    }
  });

  it("stringifies non-string members", () => {
    expect(fmStringList({ sources: ["a", 7, true, null] }, "sources")).toEqual([
      "a",
      "7",
      "true",
      "null",
    ]);
  });

  it("does not alias the parsed data", () => {
    const data = { tags: ["a"] } as Frontmatter;
    const result = fmStringList(data, "tags");
    result.push("b");
    expect(fmStringList(data, "tags")).toEqual(["a"]);
  });
});
