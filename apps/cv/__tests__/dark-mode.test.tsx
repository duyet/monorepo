import { describe, test, expect } from "bun:test";

const layoutSource = await Bun.file(
  new URL("../app/layout.tsx", import.meta.url).pathname,
).text();

describe("CV App Configuration", () => {
  test("layout has correct metadata title and description", () => {
    expect(layoutSource).toContain('"Duyet Le | Resume"');
    expect(layoutSource).toContain("Data Engineer");
  });

  test("layout has suppressHydrationWarning for theme support", () => {
    expect(layoutSource).toContain("suppressHydrationWarning");
  });

  test("layout uses ThemeProvider from @duyet/components", () => {
    expect(layoutSource).toContain("ThemeProvider");
    expect(layoutSource).toContain("@duyet/components/ThemeProvider");
  });
});
