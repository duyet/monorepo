#!/usr/bin/env bun
/**
 * Prebuild script: walks content/ and generates static files served as-is
 * by Cloudflare Pages.
 *
 * Outputs:
 * - public/robots.txt
 * - public/sitemap.xml
 * - public/llms.txt
 * - public/llms-full.txt
 * - public/k/<slug>.md        (raw markdown for every article)
 *
 * This script is self-contained — it does NOT import lib/content.ts so
 * the runtime loader can stay Vite-only (import.meta.glob).
 */

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import matter from "gray-matter";

const SCRIPT_DIR = import.meta.dir;
const APP_DIR = join(SCRIPT_DIR, "..");
const CONTENT_DIR = join(APP_DIR, "content");
const PUBLIC_DIR = join(APP_DIR, "public");
const PUBLIC_K_DIR = join(PUBLIC_DIR, "k");
const SITE_URL = "https://kb.duyet.net";

mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(PUBLIC_K_DIR, { recursive: true });

// ── Walk content/ ────────────────────────────────────────────────────────────

interface Article {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  links: string[];
  summary: string;
  updated: string;
  raw: string;
  filePath: string;
}

function walkMd(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    try {
      if (statSync(full).isDirectory()) {
        out.push(...walkMd(full));
      } else if (extname(entry) === ".md") {
        out.push(full);
      }
    } catch {
      // skip
    }
  }
  return out;
}

const articles: Article[] = [];
const categories = new Set<string>();

for (const filePath of walkMd(CONTENT_DIR)) {
  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const slug = basename(filePath, ".md");
  const article: Article = {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    category: typeof data.category === "string" ? data.category : "uncategorized",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    links: Array.isArray(data.links) ? data.links.map(String) : [],
    summary: typeof data.summary === "string" ? data.summary : "",
    updated: typeof data.updated === "string" ? data.updated : "",
    raw: content.trim(),
    filePath,
  };
  articles.push(article);
  categories.add(article.category);
}

articles.sort((a, b) => {
  if (a.updated && b.updated) return b.updated.localeCompare(a.updated);
  if (a.updated) return -1;
  if (b.updated) return 1;
  return a.title.localeCompare(b.title);
});

console.log(
  `generate-static-files: ${articles.length} articles, ${categories.size} categories`,
);

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

for (const cat of [...categories].sort()) {
  urlEntries.push(
    `  <url>\n    <loc>${SITE_URL}/c/${encodeURIComponent(cat)}</loc>\n  </url>`,
  );
}

for (const article of articles) {
  const lastmod = article.updated ? `\n    <lastmod>${article.updated}</lastmod>` : "";
  urlEntries.push(
    `  <url>\n    <loc>${SITE_URL}/k/${encodeURIComponent(article.slug)}</loc>${lastmod}\n  </url>`,
  );
}

writeFileSync(
  join(PUBLIC_DIR, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`,
  "utf-8",
);
console.log("  sitemap.xml");

// ── llms.txt ─────────────────────────────────────────────────────────────────

const llmsLines: string[] = [
  "# duyet.net Knowledge Base",
  "",
  `URL: ${SITE_URL}`,
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  `Raw Markdown: ${SITE_URL}/k/<slug>.md`,
  "",
  `${articles.length} articles across ${categories.size} categories.`,
  "",
  "## Articles",
  "",
];

for (const article of articles) {
  llmsLines.push(`### ${article.title}`);
  llmsLines.push(`URL: ${SITE_URL}/k/${article.slug}`);
  llmsLines.push(`Markdown: ${SITE_URL}/k/${article.slug}.md`);
  llmsLines.push(`Category: ${article.category}`);
  if (article.updated) llmsLines.push(`Updated: ${article.updated}`);
  if (article.summary) llmsLines.push(`Summary: ${article.summary}`);
  llmsLines.push("");
}

writeFileSync(join(PUBLIC_DIR, "llms.txt"), llmsLines.join("\n"), "utf-8");
console.log("  llms.txt");

// ── llms-full.txt ─────────────────────────────────────────────────────────────

const fullLines: string[] = [
  "# duyet.net Knowledge Base — Full Content",
  "",
  `URL: ${SITE_URL}`,
  "",
  "---",
  "",
];

for (const article of articles) {
  fullLines.push(`# ${article.title}`);
  fullLines.push(`URL: ${SITE_URL}/k/${article.slug}`);
  fullLines.push(`Category: ${article.category}`);
  if (article.updated) fullLines.push(`Updated: ${article.updated}`);
  if (article.summary) fullLines.push(`Summary: ${article.summary}`);
  fullLines.push("");
  fullLines.push(article.raw);
  fullLines.push("");
  fullLines.push("---");
  fullLines.push("");
}

writeFileSync(join(PUBLIC_DIR, "llms-full.txt"), fullLines.join("\n"), "utf-8");
console.log("  llms-full.txt");

// ── public/k/<slug>.md (raw per-article markdown) ────────────────────────────

for (const article of articles) {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(article.title)}`,
    `category: ${JSON.stringify(article.category)}`,
    article.tags.length ? `tags: [${article.tags.map((t) => JSON.stringify(t)).join(", ")}]` : "",
    `links: [${article.links.map((link) => JSON.stringify(link)).join(", ")}]`,
    article.summary ? `summary: ${JSON.stringify(article.summary)}` : "",
    article.updated ? `updated: ${JSON.stringify(article.updated)}` : "",
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");
  writeFileSync(
    join(PUBLIC_K_DIR, `${article.slug}.md`),
    `${frontmatter}${article.raw}\n`,
    "utf-8",
  );
}
console.log(`  k/<slug>.md × ${articles.length}`);

console.log("generate-static-files: done");
