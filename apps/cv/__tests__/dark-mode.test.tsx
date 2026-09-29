import { afterEach, describe, expect, test } from "vitest";
import { THEME_BOOT_SCRIPT } from "@duyet/components/ThemeProvider";
import { Route } from "../src/routes/__root";

/**
 * These assert against the root route's real `head()` output and the real theme
 * boot script, not its source text, so refactors that keep the rendered tags
 * and dark-mode behavior intact don't break the suite.
 */
const head = Route.options.head?.({} as never);
if (!head) throw new Error("root route has no head()");

const meta = head.meta ?? [];
const findMeta = (key: "title" | "property" | "name", value: string) =>
  meta.find((m) => m[key] === value) as
    | { content?: string; title?: string }
    | undefined;

const ldJson = (head.scripts ?? []).find(
  (s) => s.type === "application/ld+json",
);

describe("CV App Configuration", () => {
  test("root route has correct metadata title and description", () => {
    // TanStack head meta carries the page title on a bare `{ title }` entry.
    expect(meta.some((m) => m.title === "Duyet Le | CV")).toBe(true);
    expect(findMeta("name", "description")?.content).toContain("Data Engineer");
  });

  test("root route has schema.org JSON-LD for SEO", () => {
    expect(ldJson).toBeDefined();

    const parsed = JSON.parse(ldJson?.children as string);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("Person");
    expect(parsed.name).toBe("Duyet Le");
  });

  test("root route emits absolute og:image and twitter card tags", () => {
    // Crawlers resolve og:image against the fetching URL, not the page, so a
    // relative value in a prerendered document is unreliable.
    expect(findMeta("property", "og:image")?.content).toBe(
      "https://cv.duyet.net/og.png",
    );
    expect(findMeta("name", "twitter:card")?.content).toBe(
      "summary_large_image",
    );
  });
});

describe("theme boot script", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
  });

  /** Runs the script the root route injects into <head>, as the browser would. */
  const runBootScript = () => {
    new Function(THEME_BOOT_SCRIPT)();
  };

  test("applies the dark class when the visitor saved the dark theme", () => {
    localStorage.setItem("theme", "dark");
    runBootScript();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  test("leaves the document light by default", () => {
    runBootScript();

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});
