#!/usr/bin/env tsx
/**
 * Prebuild script: Read all posts from _posts/ and write to:
 * - public/posts-data.json  (all post metadata, no content)
 * - public/posts-content/<key>.json  (one file per post with markdown/HTML content)
 * - public/series-data.json  (all series metadata)
 *
 * This runs at build time so the Vite SPA can load post data via fetch()
 * without any Node.js fs/path APIs in the browser bundle.
 *
 * For .md posts, the markdown is pre-converted to HTML here so the route
 * loader does not need markdownToHtml (WASM) during prerender/build.
 *
 * Usage: bun scripts/generate-posts-data.ts
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Post, Series } from "@duyet/interfaces";
import { getAllPosts } from "@duyet/libs/getPost";
import { getAllSeries } from "@duyet/libs/getSeries";
import { markdownToHtml, extractWidgetFences } from "@duyet/libs/markdownToHtml";
import sanitizeHtml from "sanitize-html";

const PUBLIC_DIR = join(import.meta.dirname!, "..", "public");
const CONTENT_DIR = join(PUBLIC_DIR, "posts-content");
const WIDGETS_DIR = join(import.meta.dirname!, "..", "public", "widgets");

mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(CONTENT_DIR, { recursive: true });

console.log("Generating posts data...");

// ── Widget HTML sanitization config ─────────────────────────────────────────────
// Reuse the same config from markdownToHtml.ts for consistency
function sanitizeWidgetHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "del",
      "math",
      "semantics",
      "mrow",
      "mi",
      "mn",
      "mo",
      "mtext",
      "mfrac",
      "msup",
      "msub",
      "msubsup",
      "img",
      "svg",
      "path",
      "g",
      "circle",
      "rect",
      "line",
      "polyline",
      "polygon",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "id", "aria-hidden", "focusable", "xmlns"],
      a: ["href", "name", "target", "rel", "class", "id"],
      img: [
        "src",
        "alt",
        "title",
        "width",
        "height",
        "loading",
        "class",
      ],
      svg: ["width", "height", "viewBox", "fill", "stroke", "class"],
      path: ["d", "fill", "stroke", "stroke-width", "class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

// ── Widget resolution ───────────────────────────────────────────────────────────
/**
 * Resolve widget path to actual HTML file content.
 * Priority: post-local widgets → global widgets directory
 */
function resolveWidgetHtml(widgetPath: string, postKey: string): string | null {
  // Try post-local first: _posts/year/month/widgets/widget.html
  // Extract year/month from postKey: "2024-01-my-post" -> ["2024", "01"]
  const keyParts = postKey.split("-");
  if (keyParts.length >= 2) {
    const [year, month] = keyParts;
    const postLocalPath = join(
      import.meta.dirname!,
      "..",
      "_posts",
      year,
      month,
      widgetPath
    );
    try {
      const html = readFileSync(postLocalPath, "utf-8");
      console.log(`    → Loaded post-local widget: ${widgetPath}`);
      return html;
    } catch {
      // Post-local widget not found, try global
    }
  }

  // Try global widgets directory
  const globalPath = join(WIDGETS_DIR, widgetPath.replace(/^\.\/widgets\//, ""));
  try {
    const html = readFileSync(globalPath, "utf-8");
    return html;
  } catch {
    console.error(`  ✗ Widget not found: ${widgetPath} (tried post-local and global)`);
    return null;
  }
}

// ── posts-data.json ────────────────────────────────────────────────────────────
// All post metadata (no content) for listing pages
const metaFields = [
  "slug",
  "title",
  "date",
  "category",
  "category_slug",
  "tags",
  "excerpt",
  "featured",
  "series",
  "readingTime",
  "snippet",
  "thumbnail",
  "author",
  "changelog",
  "parent",
  "parts",
];

const allPosts = getAllPosts(metaFields, 0) as Post[];

// Serialize dates to ISO strings (Date objects are not JSON-serializable)
const postsData = allPosts.map((post) => ({
  ...post,
  slug: post.slug.replace(/\.html$/, ""),
  date: post.date instanceof Date ? post.date.toISOString() : post.date,
  tags: post.tags || [],
  tags_slug: post.tags_slug || [],
}));

writeFileSync(
  join(PUBLIC_DIR, "posts-data.json"),
  JSON.stringify(postsData),
  "utf-8"
);
console.log(`  ✓ posts-data.json (${postsData.length} posts)`);

// ── posts-content/<key>.json ───────────────────────────────────────────────────
// One file per post with raw markdown/mdx content and pre-converted HTML.
// Key is derived from slug: /2024/01/my-post -> 2024-01-my-post
// .md posts get pre-converted HTML so the route loader skips markdownToHtml
// (WASM) during prerender, which fixes SSR build failures.
const allPostsWithContent = getAllPosts(
  ["slug", "content", "isMDX"],
  0
) as Post[];

let written = 0;
let widgetCount = 0;
for (const post of allPostsWithContent) {
  // Derive a safe filename from slug: "/2024/01/foo.html" -> "2024-01-foo"
  const key = post.slug
    .replace(/\.html$/, "")
    .replace(/^\//, "")
    .replace(/\//g, "-");
  const filePath = join(CONTENT_DIR, `${key}.json`);

  // Extract widget fences before markdown conversion
  const { markdown: processedMarkdown, widgets } = extractWidgetFences(
    post.content || ""
  );

  // Resolve and inline widget HTML
  const resolvedWidgets: Record<string, string> = {};
  for (const widget of widgets) {
    const rawHtml = resolveWidgetHtml(widget.path, key);
    if (rawHtml) {
      // Sanitize widget HTML before inlining
      resolvedWidgets[widget.id] = sanitizeWidgetHtml(rawHtml);
      widgetCount++;
    }
  }

  const payload: {
    content: string;
    isMDX: boolean;
    html?: string;
    widgets?: Record<string, string>;
  } = {
    content: processedMarkdown,
    isMDX: Boolean(post.isMDX),
  };

  // Add widgets to payload if any were found
  if (Object.keys(resolvedWidgets).length > 0) {
    payload.widgets = resolvedWidgets;
  }

  // Pre-convert .md content to HTML so the route loader can skip
  // markdownToHtml (WASM) during prerender/build.
  if (!payload.isMDX && processedMarkdown) {
    try {
      payload.html = await markdownToHtml(processedMarkdown);
    } catch (err) {
      console.error(
        `  ✗ Failed to convert ${key}: ${err instanceof Error ? err.message : err}`
      );
      // Leave html undefined — the route loader will fall back to
      // markdownToHtml at runtime.
    }
  }

  writeFileSync(filePath, JSON.stringify(payload), "utf-8");
  written++;
}

// Count how many have html pre-converted
const withHtml = allPostsWithContent.filter(
  (p) => !p.isMDX && p.content
).length;
console.log(
  `  ✓ posts-content/ (${written} files, ${withHtml} pre-converted to HTML, ${widgetCount} widgets inlined)`
);

// ── series-data.json ───────────────────────────────────────────────────────────
const seriesList = getAllSeries() as Series[];
const seriesData = seriesList.map((s) => ({
  name: s.name,
  slug: s.slug,
  posts: s.posts.map((p) => ({
    slug: p.slug.replace(/\.html$/, ""),
    title: p.title,
    date: p.date instanceof Date ? p.date.toISOString() : p.date,
    excerpt: p.excerpt,
    series: p.series,
  })),
}));

writeFileSync(
  join(PUBLIC_DIR, "series-data.json"),
  JSON.stringify(seriesData),
  "utf-8"
);
console.log(`  ✓ series-data.json (${seriesData.length} series)`);

console.log("Posts data generation complete.");
