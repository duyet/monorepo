/**
 * Content loader for the KB.
 *
 * Loads two content types from the git submodule at `kb/`:
 * - Articles from the `kb/raw/kb-content` tree (frontmatter: title, category, tags, links, summary, updated)
 * - Memory notes from the `kb/memory` tree (frontmatter: name, type, description, related, sources, …)
 *
 * Bundled via `import.meta.glob` at build time; works in both prerender (Node)
 * and browser hydration.
 */

import { basename } from "node:path";
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

export type MemoryType = "user" | "feedback" | "project" | "reference" | "tech";

export interface MemoryNote {
  slug: string;
  name: string;
  title: string;
  description: string;
  memoryType: MemoryType;
  category: string;
  tags: string[];
  /** Wikilink slugs (brackets stripped from [[...]] syntax). */
  related: string[];
  sources: string[];
  aliases: string[];
  created: string;
  updated: string;
  /** Raw markdown body (without frontmatter). */
  raw: string;
}

export type ContentItem = Article | MemoryNote;

export interface KbGraph {
  /** Map from slug to list of slugs it links to (outgoing). */
  outgoing: Record<string, string[]>;
  /** Map from slug to list of slugs that link to it (incoming). */
  incoming: Record<string, string[]>;
}

interface KbContent {
  articles: Article[];
  memory: MemoryNote[];
  bySlug: Record<string, ContentItem>;
  byCategory: Record<string, Article[]>;
  byMemoryType: Record<string, MemoryNote[]>;
  graph: KbGraph;
}

// ── Module-level cache (one load per process) ─────────────────────────────────

let _cache: KbContent | null = null;

// ── Loaders ───────────────────────────────────────────────────────────────────

const RAW_ARTICLES = import.meta.glob("../kb/raw/kb-content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const RAW_MEMORY = import.meta.glob("../kb/memory/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseArticle(filePath: string, raw: string): Article | null {
  const { data, content } = matter(raw);
  const slug = basename(filePath, ".md");
  if (slug.startsWith("_")) return null;

  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    category:
      typeof data.category === "string" ? data.category : "uncategorized",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    links: Array.isArray(data.links) ? data.links.map(String) : [],
    summary: typeof data.summary === "string" ? data.summary : "",
    updated: typeof data.updated === "string" ? data.updated : "",
    raw: content.trim(),
  };
}

function parseMemory(filePath: string, raw: string): MemoryNote | null {
  const { data, content } = matter(raw);
  const slug = basename(filePath, ".md");
  if (slug.startsWith("_")) return null;

  // Strip [[wikilink]] brackets from related slugs
  const related = (Array.isArray(data.related) ? data.related : []).map(
    (r: string) => r.replace(/^\[\[/, "").replace(/\]\]$/, "").trim(),
  );

  return {
    slug,
    name: typeof data.name === "string" ? data.name : slug,
    title:
      typeof data.title === "string"
        ? data.title
        : typeof data.name === "string"
          ? data.name
          : slug,
    description: typeof data.description === "string" ? data.description : "",
    memoryType: (["user", "feedback", "project", "reference", "tech"].includes(
      data.type,
    )
      ? data.type
      : "reference") as MemoryType,
    category: typeof data.category === "string" ? data.category : "general",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    related,
    sources: Array.isArray(data.sources) ? data.sources.map(String) : [],
    aliases: Array.isArray(data.aliases) ? data.aliases.map(String) : [],
    created: typeof data.created === "string" ? data.created : "",
    updated: typeof data.updated === "string" ? data.updated : "",
    raw: content.trim(),
  };
}

// ── Content loading ───────────────────────────────────────────────────────────

export function loadContent(): KbContent {
  if (_cache) return _cache;

  const articles: Article[] = [];
  for (const [filePath, raw] of Object.entries(RAW_ARTICLES)) {
    const article = parseArticle(filePath, raw);
    if (article) articles.push(article);
  }

  const memory: MemoryNote[] = [];
  for (const [filePath, raw] of Object.entries(RAW_MEMORY)) {
    const note = parseMemory(filePath, raw);
    if (note) memory.push(note);
  }

  // Sort articles by updated date descending
  articles.sort((a, b) => {
    if (a.updated && b.updated) return b.updated.localeCompare(a.updated);
    if (a.updated) return -1;
    if (b.updated) return 1;
    return a.title.localeCompare(b.title);
  });

  // Sort memory by type order, then name
  const typeOrder: Record<string, number> = {
    user: 0,
    feedback: 1,
    project: 2,
    tech: 3,
    reference: 4,
  };
  memory.sort((a, b) => {
    const ta = typeOrder[a.memoryType] ?? 5;
    const tb = typeOrder[b.memoryType] ?? 5;
    if (ta !== tb) return ta - tb;
    return a.name.localeCompare(b.name);
  });

  // Index by slug (both types share the same namespace)
  const bySlug: Record<string, ContentItem> = {};
  for (const article of articles) bySlug[article.slug] = article;
  for (const note of memory) bySlug[note.slug] = note;

  // Index articles by category
  const byCategory: Record<string, Article[]> = {};
  for (const article of articles) {
    if (!byCategory[article.category]) byCategory[article.category] = [];
    byCategory[article.category].push(article);
  }

  // Index memory by type
  const byMemoryType: Record<string, MemoryNote[]> = {};
  for (const note of memory) {
    if (!byMemoryType[note.memoryType]) byMemoryType[note.memoryType] = [];
    byMemoryType[note.memoryType].push(note);
  }

  // Build graph edges from both content types
  const outgoing: Record<string, string[]> = {};
  const incoming: Record<string, string[]> = {};

  // Article links → article targets
  for (const article of articles) {
    outgoing[article.slug] = article.links.filter((l) => l in bySlug);
    for (const link of outgoing[article.slug]) {
      if (!incoming[link]) incoming[link] = [];
      incoming[link].push(article.slug);
    }
  }

  // Memory note related → any target
  for (const note of memory) {
    outgoing[note.slug] = note.related.filter((r) => r in bySlug);
    for (const link of outgoing[note.slug]) {
      if (!incoming[link]) incoming[link] = [];
      incoming[link].push(note.slug);
    }
  }

  _cache = {
    articles,
    memory,
    bySlug,
    byCategory,
    byMemoryType,
    graph: { outgoing, incoming },
  };
  return _cache;
}

// ── Convenience accessors ─────────────────────────────────────────────────────

// Articles
export function getAllArticles(): Article[] {
  return loadContent().articles;
}

export function getArticleBySlug(slug: string): Article | null {
  const item = loadContent().bySlug[slug];
  return item && "summary" in item ? (item as Article) : null;
}

export function getArticlesByCategory(category: string): Article[] {
  return loadContent().byCategory[category] ?? [];
}

export function getAllCategories(): string[] {
  return Object.keys(loadContent().byCategory).sort();
}

// Memory
export function getAllMemory(): MemoryNote[] {
  return loadContent().memory;
}

export function getMemoryBySlug(slug: string): MemoryNote | null {
  const item = loadContent().bySlug[slug];
  return item && "memoryType" in item ? (item as MemoryNote) : null;
}

export function getMemoryByType(type: MemoryType): MemoryNote[] {
  return loadContent().byMemoryType[type] ?? [];
}

export function getAllMemoryTypes(): MemoryType[] {
  return Object.keys(loadContent().byMemoryType).sort() as MemoryType[];
}

// Unified
export function getAllContent(): ContentItem[] {
  return [...loadContent().articles, ...loadContent().memory];
}

export function getContentBySlug(slug: string): ContentItem | null {
  return loadContent().bySlug[slug] ?? null;
}

export function getGraph(): KbGraph {
  return loadContent().graph;
}

export function getLinkedArticles(slug: string): {
  outgoing: ContentItem[];
  incoming: ContentItem[];
} {
  const { bySlug, graph } = loadContent();
  return {
    outgoing: (graph.outgoing[slug] ?? [])
      .map((s) => bySlug[s])
      .filter(Boolean),
    incoming: (graph.incoming[slug] ?? [])
      .map((s) => bySlug[s])
      .filter(Boolean),
  };
}
