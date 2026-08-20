import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = dirname(fileURLToPath(import.meta.url));

describe("blog root hydrate", () => {
  it("suppresses theme class mismatches on html/body", () => {
    const source = readFileSync(join(dir, "__root.tsx"), "utf8");
    expect(source).toContain('<html lang="en" suppressHydrationWarning>');
    expect(source).toContain("<body suppressHydrationWarning>");
  });
});
