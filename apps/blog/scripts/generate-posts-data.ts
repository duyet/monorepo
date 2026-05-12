#!/usr/bin/env bun
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

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getAllPosts } from "@duyet/libs/getPost";
import { getAllSeries } from "@duyet/libs/getSeries";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import type { Post, Series } from "@duyet/interfaces";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");
const CONTENT_DIR = join(PUBLIC_DIR, "posts-content");

mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(CONTENT_DIR, { recursive: true });

console.log("Generating posts data...");

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
  "author",
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
for (const post of allPostsWithContent) {
  // Derive a safe filename from slug: "/2024/01/foo.html" -> "2024-01-foo"
  const key = post.slug
    .replace(/\.html$/, "")
    .replace(/^\//, "")
    .replace(/\//g, "-");
  const filePath = join(CONTENT_DIR, `${key}.json`);

  const payload: { content: string; isMDX: boolean; html?: string } = {
    content: post.content || "",
    isMDX: Boolean(post.isMDX),
  };

  // Pre-convert .md content to HTML so the route loader can skip
  // markdownToHtml (WASM) during prerender/build.
  if (!payload.isMDX && post.content) {
    try {
      payload.html = await markdownToHtml(post.content);
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
const withHtml = allPostsWithContent.filter((p) => !p.isMDX && p.content).length;
console.log(`  ✓ posts-content/ (${written} files, ${withHtml} pre-converted to HTML)`);

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
