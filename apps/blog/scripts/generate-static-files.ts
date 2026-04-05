/**
 * Prebuild script: generates static files for the blog
 * - public/robots.txt
 * - public/rss.xml
 * - public/llms.txt
 * - public/llms-full.txt
 * - public/ping.json
 *
 * These replace the Next.js route.ts API handlers.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Post } from "@duyet/interfaces";
import { getAllCategories, getAllPosts } from "@duyet/libs/getPost";
import { getSlug } from "@duyet/libs/getSlug";
import RSS from "rss";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");
const SITE_URL = "https://blog.duyet.net";

// Ensure public directory exists
mkdirSync(PUBLIC_DIR, { recursive: true });

console.log("Generating static files...");

// ── robots.txt ──────────────────────────────────────────────────────────────
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap

# LLM and AI agent resources
# llms.txt: ${SITE_URL}/llms.txt
# llms-full.txt: ${SITE_URL}/llms-full.txt
`;

writeFileSync(join(PUBLIC_DIR, "robots.txt"), robotsTxt, "utf-8");
console.log("  ✓ robots.txt");

// ── rss.xml ──────────────────────────────────────────────────────────────────
const posts = (
  getAllPosts(["slug", "title", "excerpt", "date"], 50) as Post[]
).map((p) => ({ ...p, slug: p.slug.replace(/\.html$/, "") }));

const feed = new RSS({
  title: "Tôi là Duyệt",
  description: "Sr. Data Engineer. Rustacean at night",
  feed_url: `${SITE_URL}/rss.xml`,
  site_url: SITE_URL,
});

for (const post of posts) {
  feed.item({
    title: post.title || "",
    description: post.excerpt || "",
    url: `${SITE_URL}${post.slug}`,
    date: post.date,
  });
}

writeFileSync(join(PUBLIC_DIR, "rss.xml"), feed.xml({ indent: true }), "utf-8");
console.log("  ✓ rss.xml");

// ── llms.txt ──────────────────────────────────────────────────────────────────
const allPosts = (
  getAllPosts(
    ["slug", "title", "date", "category", "tags", "excerpt"],
    100000
  ) as Post[]
).map((p) => ({ ...p, slug: p.slug.replace(/\.html$/, "") }));

const llmsContent = `# Duyet Le - Technical Blog

A comprehensive collection of technical blog posts covering Data Engineering, Software Engineering, and Technology insights from Duyet Le.

## Contact
- Author: Duyet Le
- Email: me@duyet.net
- Website: https://duyet.net
- GitHub: https://github.com/duyet
- LinkedIn: https://linkedin.com/in/duyet
- Blog: ${SITE_URL}

## About This Blog

${allPosts.length}+ technical articles covering topics including:
- Data Engineering & Big Data
- Apache Spark, ClickHouse, Apache Airflow
- Cloud Computing (AWS, GCP, Azure)
- Kubernetes & DevOps
- Programming (Python, Rust, JavaScript/TypeScript)
- Machine Learning & AI
- Software Engineering Best Practices

Articles span from ${new Date(allPosts[allPosts.length - 1]?.date).getFullYear()} to ${new Date(allPosts[0]?.date).getFullYear()}, documenting the evolution of modern data engineering and software development practices.

## Recent Posts

${allPosts
  .slice(0, 20)
  .map((post: Post) => {
    const url = `${SITE_URL}${post.slug}`;
    const date = new Date(post.date).toISOString().split("T")[0];
    const tags = post.tags?.join(", ") || "";

    return `### [${post.title}](${url})
- **Date**: ${date}
- **Category**: ${post.category}
- **Tags**: ${tags}
- **URL**: ${url}
${post.excerpt ? `- **Description**: ${post.excerpt}` : ""}
`;
  })
  .join("\n")}

## All Blog Posts by Year

${Object.entries(
  allPosts.reduce((acc: Record<string, Post[]>, post: Post) => {
    const year = new Date(post.date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {})
)
  .sort(([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10))
  .map(([year, yearPosts]) => {
    return `### ${year} (${yearPosts.length} posts)

${yearPosts
  .map((post: Post) => {
    const url = `${SITE_URL}${post.slug}`;
    const date = new Date(post.date).toISOString().split("T")[0];
    return `- [${post.title}](${url}) - ${date}`;
  })
  .join("\n")}
`;
  })
  .join("\n")}

---

**Blog Statistics:**
- Total Posts: ${allPosts.length}
- Years Active: ${new Date(allPosts[allPosts.length - 1]?.date).getFullYear()}-${new Date(allPosts[0]?.date).getFullYear()}
- Categories: ${Array.from(new Set(allPosts.map((p) => p.category))).length}
- Tags: ${Array.from(new Set(allPosts.flatMap((p) => p.tags || []))).length}

Generated from: ${SITE_URL}
`;

writeFileSync(join(PUBLIC_DIR, "llms.txt"), llmsContent, "utf-8");
console.log("  ✓ llms.txt");

// ── llms-full.txt ─────────────────────────────────────────────────────────────
const fullPosts = (
  getAllPosts(
    ["slug", "title", "date", "category", "tags", "content"],
    100000
  ) as Post[]
).map((p) => ({ ...p, slug: p.slug.replace(/\.html$/, "") }));

const llmsFullContent = `# Duyet Le - Technical Blog (Full Content)

> This file contains the full markdown content of all ${fullPosts.length} blog posts.
> For a summary index, see ${SITE_URL}/llms.txt

---

${fullPosts
  .map((post: Post) => {
    const url = `${SITE_URL}${post.slug}`;
    const date = new Date(post.date).toISOString().split("T")[0];
    const tags = post.tags?.join(", ") || "";

    return `# ${(post.title || "").replace(/\n/g, " ")}

- **URL**: ${url}
- **Date**: ${date}
- **Category**: ${post.category}
- **Tags**: ${tags}

${post.content || ""}

---`;
  })
  .join("\n\n")}
`;

writeFileSync(join(PUBLIC_DIR, "llms-full.txt"), llmsFullContent, "utf-8");
console.log("  ✓ llms-full.txt");

// ── individual .md files ─────────────────────────────────────────────────────
// Generate plain markdown files at /{year}/{month}/{slug}.md paths so that
// e.g. /2026/02/claws.md serves raw markdown instead of the SPA shell.
let mdWritten = 0;
for (const post of fullPosts) {
  const slug = post.slug.replace(/^\//, "");
  const mdDir = join(PUBLIC_DIR, dirname(slug));
  mkdirSync(mdDir, { recursive: true });
  const frontmatter = [
    "---",
    `title: "${(post.title || "").replace(/"/g, '\\"')}"`,
    `date: ${new Date(post.date).toISOString().split("T")[0]}`,
    `category: ${post.category || ""}`,
    `tags: [${(post.tags || []).join(", ")}]`,
    `url: ${SITE_URL}${post.slug}`,
    "---",
  ].join("\n");
  writeFileSync(
    join(PUBLIC_DIR, `${slug}.md`),
    `${frontmatter}\n\n${post.content || ""}`,
    "utf-8"
  );
  mdWritten++;
}
console.log(`  ✓ individual .md files (${mdWritten} posts)`);

// ── sitemap.xml ───────────────────────────────────────────────────────────────
const sitemapPosts = (getAllPosts(["slug", "date"], 100000) as Post[]).map(
  (p) => ({ ...p, slug: p.slug.replace(/\.html$/, "") })
);
const categories = Object.keys(getAllCategories());

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPosts
  .map(
    (post: Post) => `  <url>
    <loc>${SITE_URL}${post.slug}</loc>
    <lastmod>${new Date(post.date).toISOString().split("T")[0]}</lastmod>
  </url>`
  )
  .join("\n")}
${categories
  .map(
    (category) => `  <url>
    <loc>${SITE_URL}/category/${getSlug(category)}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>`
  )
  .join("\n")}
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/feed</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/category</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/tags</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/archives</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/featured</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/series</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>
</urlset>
`;

writeFileSync(join(PUBLIC_DIR, "sitemap.xml"), sitemapXml, "utf-8");
console.log("  ✓ sitemap.xml");

// ── ping.json ─────────────────────────────────────────────────────────────────
writeFileSync(
  join(PUBLIC_DIR, "ping.json"),
  JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
  "utf-8"
);
console.log("  ✓ ping.json");

console.log("Static file generation complete.");
