import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/routes/__root.tsx"),
  "utf8",
);

describe("home Open Graph tags", () => {
  it("emits og and twitter card tags from the root head", () => {
    expect(root).toContain('property: "og:image"');
    expect(root).toContain('property: "og:title"');
    expect(root).toContain('name: "twitter:card"');
    expect(root).toContain("https://duyet.net/screenshots/art-1.png");
  });
});
