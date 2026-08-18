import { SITE_URL } from "./site";
import { storyPath } from "./slug";

export const SITEMAP_STATIC_PATHS = [
  "/",
  "/about",
  "/changelog",
  "/mcp",
  "/submit",
  "/subscribe",
] as const;

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSitemapXml(urls: SitemapUrl[]): string {
  const entries = urls
    .map((url) => {
      const lastmod = url.lastmod
        ? `\n    <lastmod>${escapeXml(url.lastmod)}</lastmod>`
        : "";
      const changefreq = url.changefreq
        ? `\n    <changefreq>${escapeXml(url.changefreq)}</changefreq>`
        : "";
      const priority = url.priority
        ? `\n    <priority>${escapeXml(url.priority)}</priority>`
        : "";
      return `  <url>\n    <loc>${escapeXml(url.loc)}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

export function robotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

export function staticSitemapUrls(): SitemapUrl[] {
  return SITEMAP_STATIC_PATHS.map((path) => ({
    loc: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
    changefreq: path === "/" ? "hourly" : "weekly",
    priority: path === "/" ? "1.0" : "0.4",
  }));
}

export function storySitemapUrl(item: {
  id: string;
  category: string | null;
  published_at: number;
}): SitemapUrl {
  const lastmod = Number.isFinite(item.published_at)
    ? new Date(item.published_at * 1000).toISOString().slice(0, 10)
    : undefined;
  return {
    loc: `${SITE_URL}${storyPath(item)}`,
    lastmod,
    changefreq: "daily",
    priority: "0.7",
  };
}

const SITEMAP_ITEM_LIMIT = 1000;

export async function loadSitemapUrls(db: D1Database): Promise<SitemapUrl[]> {
  const urls = staticSitemapUrls();
  try {
    const { results } = await db
      .prepare(
        `SELECT id, category, published_at FROM items
         WHERE status = 'published'
         ORDER BY published_at DESC
         LIMIT ${SITEMAP_ITEM_LIMIT}`
      )
      .all<{ id: string; category: string | null; published_at: number }>();
    for (const row of results ?? []) {
      urls.push(storySitemapUrl(row));
    }
  } catch {
    // D1 unavailable — still emit the static pages so the route is valid XML.
  }
  return urls;
}

export function sitemapResponse(xml: string): Response {
  return new Response(xml, {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control":
        "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}

export function robotsResponse(): Response {
  return new Response(robotsTxt(), {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
