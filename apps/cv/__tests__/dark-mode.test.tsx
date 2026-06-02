import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const rootSource = readFileSync(
  join(import.meta.dirname!, "../src/routes/__root.tsx"),
  "utf-8",
);

describe("CV App Configuration", () => {
  test("root route has correct metadata title and description", () => {
    expect(rootSource).toContain("Duyet Le | CV");
    expect(rootSource).toContain("Data Engineer");
  });

  test("root route has schema.org JSON-LD for SEO", () => {
    expect(rootSource).toContain("application/ld+json");
    expect(rootSource).toContain("schema.org");
    expect(rootSource).toContain("Duyet Le");
  });

  test("root route uses ThemeProvider from @duyet/components", () => {
    expect(rootSource).toContain("ThemeProvider");
    expect(rootSource).toContain("@duyet/components/ThemeProvider");
  });
});
