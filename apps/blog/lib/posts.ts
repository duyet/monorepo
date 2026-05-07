/**
 * Isomorphic post data layer.
 *
 * Loads post metadata and content from pre-generated JSON files in /public/.
 * During SSR/prerender: reads files from disk via fs.
 * During client navigation: fetches via HTTP.
 *
 * Generated at build time by scripts/generate-posts-data.ts.
 */

import type { CategoryCount, Post, Series, TagCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";

const isServer = typeof window === "undefined";

async function readPublicJson<T>(path: string): Promise<T> {
  if (isServer) {
    const { readFileSync, existsSync } = await import("node:fs");
    const { join } = await import("node:path");
    const baseDir = import.meta.dirname ?? process.cwd();
    // During dev: public/ is next to src/
    // During build/prerender: files are in dist/client/ (server is dist/server/)
    const candidates = [
      join(baseDir, "..", "public", path),
      join(baseDir, "..", "client", path),
      join(process.cwd(), "public", path),
    ];
    const filePath = candidates.find((p) => existsSync(p));
    if (!filePath) throw new Error(`Public file not found: ${path}`);
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  }
  const res = await fetch(`/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

/** Raw post shape as stored in posts-data.json (date is ISO string). */
interface RawPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  category_slug: string;
  tags: string[];
  tags_slug: string[];
  featured: boolean;
  thumbnail?: string;
  author?: string;
  excerpt?: string;
  series?: string;
  snippet?: string;
  readingTime?: number;
  isMDX?: boolean;
}

/** Per-post content payload loaded from posts-content/<key>.json. */
export interface PostContent {
  content: string;
  isMDX: boolean;
}

/** Navigation item within a series (prev/next). */
export interface SeriesNavItem {
  slug: string;
  title: string;
  year: string;
  month: string;
}

// ── Module-level caches (avoid re-fetching during one page load) ──────────────

let postsCache: Post[] | null = null;
let seriesCache: Series[] | null = null;
const contentCache = new Map<string, PostContent>();

// ── Hydration ─────────────────────────────────────────────────────────────────

function hydratePost(raw: RawPost): Post {
  return {
    ...raw,
    date: new Date(raw.date),
    tags: raw.tags ?? [],
    tags_slug: raw.tags_slug ?? [],
  };
}

// ── Core fetch functions ───────────────────────────────────────────────────────

export async function fetchAllPosts(): Promise<Post[]> {
  if (postsCache) return postsCache;
  const raw = await readPublicJson<RawPost[]>("posts-data.json");
  postsCache = raw.map(hydratePost);
  return postsCache;
}

export async function fetchPostContent(slug: string): Promise<PostContent> {
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;
  const cached = contentCache.get(normalizedSlug);
  if (cached) return cached;

  // Derive key: "/2024/01/my-post" -> "2024-01-my-post"
  const key = normalizedSlug.replace(/^\//, "").replace(/\//g, "-");
  const data = await readPublicJson<PostContent>(`posts-content/${key}.json`);
  contentCache.set(normalizedSlug, data);
  return data;
}

export async function fetchAllSeries(): Promise<Series[]> {
  if (seriesCache) return seriesCache;
  const raw =
    await readPublicJson<
      Array<{
        name: string;
        slug: string;
        posts: Array<{
          slug: string;
          title: string;
          date: string;
          excerpt?: string;
          series?: string;
        }>;
      }>
    >("series-data.json");

  seriesCache = raw.map((s) => ({
    ...s,
    posts: s.posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      date: new Date(p.date),
      excerpt: p.excerpt,
      series: p.series,
      category: "",
      category_slug: "",
      tags: [],
      tags_slug: [],
      featured: false,
    })),
  }));
  return seriesCache;
}

// ── Posts API ─────────────────────────────────────────────────────────────────

export async function getAllPosts(): Promise<Post[]> {
  return fetchAllPosts();
}

export async function getPostBySlug(
  slugPath: string
): Promise<Post & PostContent> {
  const posts = await fetchAllPosts();
  const fullSlug = slugPath.startsWith("/") ? slugPath : `/${slugPath}`;
  // Strip .md / .html extensions
  const cleanSlug = fullSlug.replace(/\.(md|html)$/, "");
  const post = posts.find((p) => p.slug.replace(/\.html$/, "") === cleanSlug);
  if (!post) throw new Error(`Post not found: ${slugPath}`);
  const content = await fetchPostContent(post.slug);
  return { ...post, ...content };
}

export async function getAllCategories(): Promise<CategoryCount> {
  const posts = await fetchAllPosts();
  return posts.reduce<CategoryCount>((acc, post) => {
    if (post.category) {
      acc[post.category] = (acc[post.category] ?? 0) + 1;
    }
    return acc;
  }, {});
}

export async function getAllTags(): Promise<TagCount> {
  const posts = await fetchAllPosts();
  return posts.reduce<TagCount>((acc, post) => {
    for (const tag of post.tags ?? []) {
      acc[tag] = (acc[tag] ?? 0) + 1;
    }
    return acc;
  }, {});
}

export async function getPostsByAllYear(
  featured?: boolean
): Promise<Record<number, Post[]>> {
  const posts = await fetchAllPosts();
  const filtered = featured ? posts.filter((p) => p.featured) : posts;
  return filtered.reduce<Record<number, Post[]>>((acc, post) => {
    const year = new Date(post.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});
}

export async function getPostsByYear(year: number): Promise<Post[]> {
  const posts = await fetchAllPosts();
  return posts.filter((p) => new Date(p.date).getFullYear() === year);
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await fetchAllPosts();
  return posts.filter(
    (p) =>
      getSlug(p.category) === category ||
      p.category_slug === category ||
      p.category === category
  );
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await fetchAllPosts();
  return posts.filter(
    (p) =>
      (p.tags_slug ?? []).includes(tag) ||
      (p.tags ?? []).some((t) => getSlug(t) === tag) ||
      (p.tags_slug ?? []).some((s) => s.endsWith(`-${tag}`))
  );
}

// ── Series API ────────────────────────────────────────────────────────────────

export async function getAllSeries(): Promise<Series[]> {
  return fetchAllSeries();
}

export async function getSeries(opts: {
  name?: string;
  slug?: string;
}): Promise<Series | null> {
  const all = await fetchAllSeries();
  if (opts.slug) return all.find((s) => s.slug === opts.slug) ?? null;
  if (opts.name) return all.find((s) => s.name === opts.name) ?? null;
  return null;
}

export async function getSeriesNavigation(
  currentSlug: string,
  seriesName: string
): Promise<{ prev: SeriesNavItem | null; next: SeriesNavItem | null }> {
  const all = await fetchAllSeries();
  const series = all.find((s) => s.name === seriesName);
  if (!series) return { prev: null, next: null };

  const sorted = [...series.posts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const fullSlug = currentSlug.startsWith("/")
    ? currentSlug
    : `/${currentSlug}`;
  const currentIndex = sorted.findIndex((p) => p.slug === fullSlug);
  if (currentIndex === -1) return { prev: null, next: null };

  function toNavItem(post: Post): SeriesNavItem {
    const clean = post.slug.replace(/^\//, "").replace(/\.md$/, "");
    const parts = clean.split("/");
    return {
      slug: parts[2],
      title: post.title,
      year: parts[0],
      month: parts[1],
    };
  }

  return {
    prev: currentIndex > 0 ? toNavItem(sorted[currentIndex - 1]) : null,
    next:
      currentIndex < sorted.length - 1
        ? toNavItem(sorted[currentIndex + 1])
        : null,
  };
}

export async function getRelatedPosts(post: Post, limit = 4): Promise<Post[]> {
  const posts = await fetchAllPosts();
  const candidates = posts.filter((p) => {
    if (p.slug === post.slug) return false;
    if (p.category === post.category) return true;
    const sharedTags = (p.tags ?? []).filter((t) =>
      (post.tags ?? []).includes(t)
    );
    return sharedTags.length > 0;
  });

  // Sort by date descending, return top `limit`
  return candidates
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
