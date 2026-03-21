import { describe, expect, test } from "bun:test";

const rootSource = await Bun.file(
  new URL("../src/routes/__root.tsx", import.meta.url).pathname
).text();

const indexHtml = await Bun.file(
  new URL("../index.html", import.meta.url).pathname
).text();

describe("CV App Configuration", () => {
  test("index.html has correct metadata title and description", () => {
    expect(indexHtml).toContain("Duyet Le | CV");
    expect(indexHtml).toContain("Data Engineer");
  });

  test("index.html has schema.org JSON-LD for SEO", () => {
    expect(indexHtml).toContain("application/ld+json");
    expect(indexHtml).toContain("schema.org");
    expect(indexHtml).toContain("Duyet Le");
  });

  test("root route uses ThemeProvider from @duyet/components", () => {
    expect(rootSource).toContain("ThemeProvider");
    expect(rootSource).toContain("@duyet/components/ThemeProvider");
  });
});
