import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "index.tsx"),
  "utf8",
);

describe("blog post head", () => {
  it("emits canonical and BlogPosting JSON-LD", () => {
    expect(source).toContain('rel: "canonical"');
    expect(source).toContain("application/ld+json");
    expect(source).toContain("BlogPosting");
  });
});
