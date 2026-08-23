import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const routesDir = join(here, "../src/routes");
const sitemap = readFileSync(join(here, "../public/sitemap.xml"), "utf8");

function routeFileToPath(file: string): string | null {
  if (file === "index.tsx") return "/";
  if (file.startsWith("__") || !file.endsWith(".tsx")) return null;
  return `/${file.replace(/\.tsx$/, "")}`;
}

describe("home sitemap.xml", () => {
  it("lists every top-level indexable route", () => {
    const files = readdirSync(routesDir);
    const paths = files
      .map(routeFileToPath)
      .filter((path): path is string => path !== null);

    expect(paths).toContain("/projects");
    expect(paths).toContain("/cartrack");
    expect(paths).toContain("/about-duyetbot");
    expect(paths).toContain("/developers");
    expect(paths).toContain("/contact");
    expect(paths).toContain("/privacy");

    for (const path of paths) {
      const loc = `https://duyet.net${path === "/" ? "/" : path}`;
      expect(sitemap, `missing ${loc}`).toContain(`<loc>${loc}</loc>`);
    }
  });

  it("lists product pages and stamps new entries with a lastmod date", () => {
    for (const slug of ["anyrouter", "chm", "stamp"]) {
      expect(sitemap, `missing /p/${slug}`).toContain(
        `<loc>https://duyet.net/p/${slug}</loc>`
      );
    }

    const newPaths = [
      "/developers",
      "/contact",
      "/privacy",
      "/p/anyrouter",
      "/p/chm",
      "/p/stamp",
    ];
    for (const path of newPaths) {
      const entry = sitemap.split("<url>").find((block) =>
        block.includes(`<loc>https://duyet.net${path}</loc>`)
      );
      expect(entry, `no <url> block for ${path}`).toBeTruthy();
      expect(entry).toContain("<lastmod>2026-08-22</lastmod>");
    }
  });
});
