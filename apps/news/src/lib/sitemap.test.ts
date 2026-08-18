import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SITE_URL } from "./site";
import {
  buildSitemapXml,
  escapeXml,
  robotsTxt,
  staticSitemapUrls,
  storySitemapUrl,
} from "./sitemap";

describe("escapeXml", () => {
  it("escapes markup-sensitive characters", () => {
    expect(escapeXml(`<a href="x">&'`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&apos;"
    );
  });
});

describe("buildSitemapXml", () => {
  it("emits a valid urlset with loc and optional lastmod", () => {
    const xml = buildSitemapXml([
      { loc: `${SITE_URL}/`, changefreq: "hourly", priority: "1.0" },
      {
        loc: `${SITE_URL}/industry/abcdef12`,
        lastmod: "2026-08-16",
        changefreq: "daily",
        priority: "0.7",
      },
    ]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(
      'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
    );
    expect(xml).toContain(`<loc>${SITE_URL}/</loc>`);
    expect(xml).toContain(`<loc>${SITE_URL}/industry/abcdef12</loc>`);
    expect(xml).toContain("<lastmod>2026-08-16</lastmod>");
    expect(xml).toContain("</urlset>");
  });

  it("escapes loc values so the document stays well-formed", () => {
    const xml = buildSitemapXml([{ loc: `${SITE_URL}/a&b` }]);
    expect(xml).toContain(`<loc>${SITE_URL}/a&amp;b</loc>`);
    expect(xml).not.toContain(`${SITE_URL}/a&b`);
  });
});

describe("staticSitemapUrls", () => {
  it("includes the homepage and top-level marketing routes", () => {
    const locs = staticSitemapUrls().map((u) => u.loc);
    expect(locs).toContain(`${SITE_URL}/`);
    expect(locs).toContain(`${SITE_URL}/about`);
    expect(locs).toContain(`${SITE_URL}/mcp`);
  });
});

describe("storySitemapUrl", () => {
  it("uses the category + 8-char id permalink", () => {
    expect(
      storySitemapUrl({
        id: "abcdef12deadbeef",
        category: "Research",
        published_at: 1_787_000_000,
      }).loc
    ).toBe(`${SITE_URL}/research/abcdef12`);
  });
});

describe("robotsTxt", () => {
  it("points crawlers at the sitemap", () => {
    const text = robotsTxt();
    expect(text).toMatch(/^User-agent: \*$/m);
    expect(text).toContain("Allow: /");
    expect(text).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  it("matches the committed public/robots.txt origin file", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const published = readFileSync(
      join(here, "../../public/robots.txt"),
      "utf8"
    );
    expect(published).toBe(robotsTxt());
  });
});
