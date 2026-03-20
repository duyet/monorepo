/**
 * Post-build prerender script.
 * Copies dist/index.html to dist/<route>/index.html for each static route.
 * This enables direct URL access on Cloudflare Pages without the SPA fallback.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");

// Static routes to prerender (excluding /)
const routes = ["/about", "/ls"];

const indexHtml = readFileSync(resolve(distDir, "index.html"), "utf-8");

for (const route of routes) {
  const dir = resolve(distDir, route.slice(1));
  mkdirSync(dir, { recursive: true });
  const outPath = resolve(dir, "index.html");
  writeFileSync(outPath, indexHtml);
  console.log(`Prerendered: ${route} → dist${route}/index.html`);
}

// Generate sitemap.xml
const siteUrl = "https://duyet.net";
const lastModified = new Date().toISOString();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/ls</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

writeFileSync(resolve(distDir, "sitemap.xml"), sitemap);
console.log("Generated: dist/sitemap.xml");
