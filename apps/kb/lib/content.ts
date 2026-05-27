/**
 * Content loader for the KB.
 *
 * Dual-mode: when running inside the Vite bundle (browser/prerender)
 * markdown is bundled via `import.meta.glob`. When running under Bun
 * (prebuild scripts), it falls back to a filesystem walk.
 */

import { basename, extname, join, dirname } from "node:path";
import matter from "gray-matter";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Article {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  /** Slugs of other KB articles this article links to (graph edges). */
  links: string[];
  summary: string;
  updated: string;
  /** Raw markdown body (without frontmatter). */
  raw: string;
}

export interface KbGraph {
  /** Map from slug to list of slugs it links to (outgoing). */
  outgoing: Record<string, string[]>;
  /** Map from slug to list of slugs that link to it (incoming). */
  incoming: Record<string, string[]>;
}

export interface KbContent {
  articles: Article[];
  bySlug: Record<string, Article>;
  byCategory: Record<string, Article[]>;
  graph: KbGraph;
}

// ── Module-level cache (one load per process) ─────────────────────────────────

let _cache: KbContent | null = null;

// ── Loader ────────────────────────────────────────────────────────────────────

// Bundle every .md file under content/ at build time — works in Node and browser.
const RAW_CONTENT = import.meta.glob("../content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseArticle(filePath: string, raw: string): Article | null {
  const { data, content } = matter(raw);

  // Derive slug from filename (no extension)
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
  };

  return article;
}

export function loadContent(): KbContent {
  if (_cache) return _cache;

  const articles: Article[] = [];
  for (const [filePath, raw] of Object.entries(RAW_CONTENT)) {
    const article = parseArticle(filePath, raw);
    if (article) articles.push(article);
  }

  // Sort by updated date descending, then alphabetically
  articles.sort((a, b) => {
    if (a.updated && b.updated) {
      return b.updated.localeCompare(a.updated);
    }
    if (a.updated) return -1;
    if (b.updated) return 1;
    return a.title.localeCompare(b.title);
  });

  const bySlug: Record<string, Article> = {};
  for (const article of articles) {
    bySlug[article.slug] = article;
  }

  const byCategory: Record<string, Article[]> = {};
  for (const article of articles) {
    if (!byCategory[article.category]) byCategory[article.category] = [];
    byCategory[article.category].push(article);
  }

  // Build graph edges
  const outgoing: Record<string, string[]> = {};
  const incoming: Record<string, string[]> = {};

  for (const article of articles) {
    outgoing[article.slug] = article.links.filter((l) => l in bySlug);
    for (const link of outgoing[article.slug]) {
      if (!incoming[link]) incoming[link] = [];
      incoming[link].push(article.slug);
    }
  }

  _cache = { articles, bySlug, byCategory, graph: { outgoing, incoming } };
  return _cache;
}

// ── Convenience accessors ─────────────────────────────────────────────────────

export function getAllArticles(): Article[] {
  return loadContent().articles;
}

export function getArticleBySlug(slug: string): Article | null {
  return loadContent().bySlug[slug] ?? null;
}

export function getArticlesByCategory(category: string): Article[] {
  return loadContent().byCategory[category] ?? [];
}

export function getAllCategories(): string[] {
  return Object.keys(loadContent().byCategory).sort();
}

export function getGraph(): KbGraph {
  return loadContent().graph;
}

export function getLinkedArticles(slug: string): {
  outgoing: Article[];
  incoming: Article[];
} {
  const { bySlug, graph } = loadContent();
  return {
    outgoing: (graph.outgoing[slug] ?? []).map((s) => bySlug[s]).filter(Boolean),
    incoming: (graph.incoming[slug] ?? []).map((s) => bySlug[s]).filter(Boolean),
  };
}
