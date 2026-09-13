import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "-content.tsx"),
  "utf8"
);

describe("post content static HTML", () => {
  it("keeps prerendered HTML while MDX compiles", () => {
    expect(source).toContain("ProgressiveMDX");
    expect(source).toContain("StaticArticle");
    expect(source).toContain("dangerouslySetInnerHTML");
    expect(source).not.toContain("fallback={staticArticle}");
  });

  it("registers prompt as a highlight.js language factory", () => {
    expect(source).toContain("prompt: promptLanguage");
    expect(source).not.toContain("prompt: promptLanguage()");
  });
});
