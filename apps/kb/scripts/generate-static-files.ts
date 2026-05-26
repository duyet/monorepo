#!/usr/bin/env bun
/**
 * Prebuild script: generates static files for the KB.
 * - public/robots.txt
 * - public/sitemap.xml
 * - public/llms.txt
 * - public/llms-full.txt
 *
 * These are served directly by Cloudflare Pages ASSETS as static files.
 *
 * Usage: bun scripts/generate-static-files.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");
const SITE_URL = "https://kb.duyet.net";

mkdirSync(PUBLIC_DIR, { recursive: true });

// Dynamic import of content loader (works in Bun server environment)
const { getAllArticles, getAllCategories } = await import("../lib/content");

const articles = getAllArticles();
const categories = getAllCategories();

console.log(`generate-static-files: ${articles.length} articles, ${categories.length} categories`);

// ── robots.txt ───────────────────────────────────────────────────────────────

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml

# LLM and AI agent resources
# llms.txt: ${SITE_URL}/llms.txt
# llms-full.txt: ${SITE_URL}/llms-full.txt
`;

writeFileSync(join(PUBLIC_DIR, "robots.txt"), robotsTxt, "utf-8");
console.log("  robots.txt");

// ── sitemap.xml ──────────────────────────────────────────────────────────────

const urlEntries: string[] = [
  `  <url>\n    <loc>${SITE_URL}/</loc>\n  </url>`,
  `  <url>\n    <loc>${SITE_URL}/graph</loc>\n  </url>`,
];

for (const cat of categories) {
  urlEntries.push(`  <url>\n    <loc>${SITE_URL}/c/${encodeURIComponent(cat)}</loc>\n  </url>`);
}

for (const article of articles) {
  const lastmod = article.updated ? `\n    <lastmod>${article.updated}</lastmod>` : "";
  urlEntries.push(
    `  <url>\n    <loc>${SITE_URL}/k/${encodeURIComponent(article.slug)}</loc>${lastmod}\n  </url>`
  );
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;

writeFileSync(join(PUBLIC_DIR, "sitemap.xml"), sitemapXml, "utf-8");
console.log("  sitemap.xml");

// ── llms.txt ─────────────────────────────────────────────────────────────────

const llmsLines: string[] = [
  `# duyet.net Knowledge Base`,
  ``,
  `URL: ${SITE_URL}`,
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  `Raw Markdown: ${SITE_URL}/k/<slug>.md`,
  ``,
  `${articles.length} articles across ${categories.length} categories.`,
  ``,
  `## Articles`,
  ``,
];

for (const article of articles) {
  llmsLines.push(`### ${article.title}`);
  llmsLines.push(`URL: ${SITE_URL}/k/${article.slug}`);
  llmsLines.push(`Category: ${article.category}`);
  if (article.updated) llmsLines.push(`Updated: ${article.updated}`);
  if (article.summary) llmsLines.push(`Summary: ${article.summary}`);
  llmsLines.push(``);
}

writeFileSync(join(PUBLIC_DIR, "llms.txt"), llmsLines.join("\n"), "utf-8");
console.log("  llms.txt");

// ── llms-full.txt ─────────────────────────────────────────────────────────────

const fullLines: string[] = [
  `# duyet.net Knowledge Base — Full Content`,
  ``,
  `URL: ${SITE_URL}`,
  ``,
  `---`,
  ``,
];

for (const article of articles) {
  fullLines.push(`# ${article.title}`);
  fullLines.push(`URL: ${SITE_URL}/k/${article.slug}`);
  fullLines.push(`Category: ${article.category}`);
  if (article.updated) fullLines.push(`Updated: ${article.updated}`);
  if (article.summary) fullLines.push(`Summary: ${article.summary}`);
  fullLines.push(``);
  fullLines.push(article.raw);
  fullLines.push(``);
  fullLines.push(`---`);
  fullLines.push(``);
}

writeFileSync(join(PUBLIC_DIR, "llms-full.txt"), fullLines.join("\n"), "utf-8");
console.log("  llms-full.txt");

console.log("generate-static-files: done");
