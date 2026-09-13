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
    expect(source).toContain("Suspense");
    expect(source).toContain("fallback={staticArticle}");
    expect(source).toContain("dangerouslySetInnerHTML");
  });

  it("registers prompt as a highlight.js language factory", () => {
    expect(source).toContain("prompt: promptLanguage");
    expect(source).not.toContain("prompt: promptLanguage()");
  });
});
