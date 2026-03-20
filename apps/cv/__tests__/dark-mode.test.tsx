import { describe, expect, test } from "bun:test";

const rootSource = await Bun.file(
  new URL("../src/routes/__root.tsx", import.meta.url).pathname
).text();

describe("CV App Configuration", () => {
  test("root route has correct metadata title and description", () => {
    expect(rootSource).toContain('"Duyet Le | Resume"');
    expect(rootSource).toContain("Data Engineer");
  });

  test("root route has suppressHydrationWarning for theme support", () => {
    expect(rootSource).toContain("suppressHydrationWarning");
  });

  test("root route uses ThemeProvider from @duyet/components", () => {
    expect(rootSource).toContain("ThemeProvider");
    expect(rootSource).toContain("@duyet/components/ThemeProvider");
  });
});
