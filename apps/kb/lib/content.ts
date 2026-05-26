/**
 * Build-time content loader for the KB.
 *
 * Reads all content/**\/*.md files synchronously, parses frontmatter with
 * gray-matter, and builds derived data structures used by routes.
 *
 * This module is imported at route loader time (prerender / SSR). It must
 * only run in a Node/Bun environment — never in the browser bundle.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
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

function resolveContentDir(): string {
  // Works from both apps/kb (dev) and apps/kb/src/* (build/prerender context)
  // __dirname is the lib/ directory, so go up one level to apps/kb/
  const candidates = [
    join(import.meta.dirname ?? __dirname, "..", "content"),
    join(process.cwd(), "content"),
  ];
  for (const dir of candidates) {
    try {
      readdirSync(dir);
      return dir;
    } catch {
      // try next
    }
  }
  return candidates[0];
}

function walkMd(dir: string): string[] {
  const paths: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return paths;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    try {
      if (statSync(full).isDirectory()) {
        paths.push(...walkMd(full));
      } else if (extname(entry) === ".md") {
        paths.push(full);
      }
    } catch {
      // skip inaccessible entries
    }
  }
  return paths;
}

function parseArticle(filePath: string, _contentDir: string): Article | null {
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }

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

  const contentDir = resolveContentDir();
  const filePaths = walkMd(contentDir);

  const articles: Article[] = [];
  for (const filePath of filePaths) {
    const article = parseArticle(filePath, contentDir);
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
