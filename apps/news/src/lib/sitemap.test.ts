import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SITE_URL } from "./site";
import {
  buildSitemapXml,
  escapeXml,
  robotsTxt,
  safeSitemapResponse,
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

describe("safeSitemapResponse", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stays 200 XML when env/DB throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await safeSitemapResponse(async () => {
      throw new Error("env/DB unavailable");
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/application\/xml/);
    const xml = await res.text();
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(`<loc>${SITE_URL}/</loc>`);
    expect(xml).toContain("</urlset>");
    expect(console.error).toHaveBeenCalled();
  });

  it("stays 200 XML when DB property access throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await safeSitemapResponse(async () => {
      const env = {
        get DB(): D1Database {
          throw new Error("D1 binding getter failed");
        },
      };
      return env.DB
        ? Promise.reject(new Error("unreachable"))
        : staticSitemapUrls();
    });
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain(
      'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
    );
    expect(xml).toContain(`<loc>${SITE_URL}/</loc>`);
  });

  it("returns loaded urls when the loader succeeds", async () => {
    const res = await safeSitemapResponse(() => [{ loc: `${SITE_URL}/about` }]);
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain(`<loc>${SITE_URL}/about</loc>`);
    expect(xml).not.toContain(`<loc>${SITE_URL}/mcp</loc>`);
  });
});
