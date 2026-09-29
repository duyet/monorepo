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

import yaml from "js-yaml";
import { splitFrontmatter } from "@duyet/libs/frontmatter";
import { fmString, fmStringList } from "./frontmatter-fields";
import { extractWikilinks, normalizeRelatedRefs } from "./wikilinks";

// Browser-safe basename: `node:path` is undefined in the client bundle, so the
// loader (which re-runs on client-side navigation) must not depend on it.
function slugFromPath(filePath: string): string {
  return (filePath.split("/").pop() ?? "").replace(/\.md$/, "");
}

// Browser-safe frontmatter parser. Replaces `gray-matter`, which pulls in
// Node's `Buffer` and crashes during client-side navigation. js-yaml is the
// same engine gray-matter uses, so parsed output is identical.
//
// The fence split itself is shared with the blog's shortform loader and this
// app's own `stripFrontmatter`, which had drifted into three different regexes
// — see `@duyet/libs/frontmatter` for what differed. YAML parsing stays here
// because the engine choice is app-specific.
// Frontmatter shape is dynamic; the shared accessors in
// `./frontmatter-fields` guard every field.
type Frontmatter = Record<string, any>;
function parseFrontmatter(raw: string): { data: Frontmatter; content: string } {
  const split = splitFrontmatter(raw);
  if (!split) return { data: {}, content: raw };
  const data = (yaml.load(split.frontmatter) as Frontmatter) ?? {};
  return { data, content: split.body };
}

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
  /** ISO 8601 creation/revision timestamp from frontmatter, if present. */
  timestamp: string;
  /** Raw markdown body (without frontmatter). */
  raw: string;
}

export interface InboxNote {
  slug: string;
  date: string;
  title: string;
  /** Wikilink slugs parsed from the body (brackets stripped). */
  links: string[];
  /** Raw markdown body (without frontmatter, if any). */
  raw: string;
}

export type ContentItem = Article | MemoryNote | InboxNote;

export interface KbGraph {
  /** Map from slug to list of slugs it links to (outgoing). */
  outgoing: Record<string, string[]>;
  /** Map from slug to list of slugs that link to it (incoming). */
  incoming: Record<string, string[]>;
}

const MEMORY_TYPES = [
  "user",
  "feedback",
  "project",
  "reference",
  "tech",
] as const;

interface KbContent {
  articles: Article[];
  memory: MemoryNote[];
  inbox: InboxNote[];
  bySlug: Record<string, ContentItem>;
  byCategory: Record<string, Article[]>;
  byMemoryType: Record<string, MemoryNote[]>;
  graph: KbGraph;
}

// ── Module-level cache (one load per process) ─────────────────────────────────

let _cache: KbContent | null = null;

// ── Loaders ───────────────────────────────────────────────────────────────────

const RAW_DREAM = import.meta.glob("../kb/DREAM.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const RAW_STATE = import.meta.glob("../kb/.agent/state.json", {
  import: "default",
  eager: true,
}) as Record<string, { last_dream?: string }>;

export function getDreamContent(): { raw: string; lastDream: string } {
  const raw = Object.values(RAW_DREAM)[0] ?? "";
  const state = Object.values(RAW_STATE)[0] ?? {};
  return { raw, lastDream: state.last_dream ?? "" };
}

const RAW_README = import.meta.glob("../kb/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export function getReadmeContent(): string {
  return Object.values(RAW_README)[0] ?? "";
}

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

const RAW_INBOX = import.meta.glob("../kb/raw/inbox/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseArticle(filePath: string, raw: string): Article | null {
  const { data, content } = parseFrontmatter(raw);
  const slug = slugFromPath(filePath);
  if (slug.startsWith("_")) return null;

  return {
    slug,
    title: fmString(data, "title", slug),
    category: fmString(data, "category", "uncategorized"),
    tags: fmStringList(data, "tags"),
    links: fmStringList(data, "links"),
    summary: fmString(data, "summary", ""),
    updated: fmString(data, "updated", ""),
    raw: content.trim(),
  };
}

function parseMemory(filePath: string, raw: string): MemoryNote | null {
  const { data, content } = parseFrontmatter(raw);
  const slug = slugFromPath(filePath);
  if (slug.startsWith("_") || slug === "index" || slug === "log") return null;

  const name = fmString(data, "name", slug);

  return {
    slug,
    name,
    title: typeof data.title === "string" ? data.title : name,
    description: fmString(data, "description", ""),
    memoryType: (MEMORY_TYPES as readonly string[]).includes(data.type)
      ? (data.type as MemoryType)
      : "reference",
    category: fmString(data, "category", "general"),
    tags: fmStringList(data, "tags"),
    // Strip [[wikilink]] brackets from related slugs
    related: normalizeRelatedRefs(data.related),
    sources: fmStringList(data, "sources"),
    aliases: fmStringList(data, "aliases"),
    created: fmString(data, "created", ""),
    updated: fmString(data, "updated", ""),
    timestamp: fmString(data, "timestamp", ""),
    raw: content.trim(),
  };
}

function parseInbox(filePath: string, raw: string): InboxNote | null {
  const { data, content } = parseFrontmatter(raw);
  const slug = slugFromPath(filePath); // "YYYY-MM-DD"
  if (slug.startsWith("_")) return null;

  const body = content.trim();
  const headingMatch = body.match(/^#\s+(.+)$/m);

  return {
    slug,
    date: slug,
    title: fmString(data, "title", headingMatch?.[1]?.trim() ?? `Inbox ${slug}`),
    links: extractWikilinks(body),
    raw: body,
  };
}

// ── Content loading ───────────────────────────────────────────────────────────

/** Newest `updated` first; undated items sort after dated ones, then by title. */
function byUpdatedThenTitle(
  a: { updated: string; title: string },
  b: { updated: string; title: string }
): number {
  if (a.updated && b.updated) return b.updated.localeCompare(a.updated);
  if (a.updated) return -1;
  if (b.updated) return 1;
  return a.title.localeCompare(b.title);
}

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

  const inbox: InboxNote[] = [];
  for (const [filePath, raw] of Object.entries(RAW_INBOX)) {
    const note = parseInbox(filePath, raw);
    if (note) inbox.push(note);
  }
  inbox.sort((a, b) => b.date.localeCompare(a.date));

  // Sort articles by updated date descending
  articles.sort(byUpdatedThenTitle);

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
    // Within a type: newer timestamp first, then name as the stable fallback.
    if (a.timestamp && b.timestamp)
      return b.timestamp.localeCompare(a.timestamp);
    return a.name.localeCompare(b.name);
  });

  // Index by slug (both types share the same namespace)
  const bySlug: Record<string, ContentItem> = {};
  for (const article of articles) bySlug[article.slug] = article;
  for (const note of memory) bySlug[note.slug] = note;
  for (const note of inbox) bySlug[note.slug] = note;

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

  // Build graph edges from all three content types. Every type resolves its
  // outgoing edges the same way — declared refs plus body wikilinks, kept only
  // when they name a slug that exists — so it is one pass over one shape.
  const outgoing: Record<string, string[]> = {};
  const incoming: Record<string, string[]> = {};

  const linkSources: Array<{ slug: string; refs: string[] }> = [
    ...articles.map((a) => ({
      slug: a.slug,
      refs: [...new Set([...a.links, ...extractWikilinks(a.raw)])],
    })),
    ...memory.map((n) => ({
      slug: n.slug,
      refs: [...new Set([...n.related, ...extractWikilinks(n.raw)])],
    })),
    ...inbox.map((n) => ({ slug: n.slug, refs: n.links })),
  ];

  for (const { slug, refs } of linkSources) {
    const targets = refs.filter((r) => r in bySlug);
    outgoing[slug] = targets;
    for (const target of targets) {
      if (!incoming[target]) incoming[target] = [];
      incoming[target].push(slug);
    }
  }

  _cache = {
    articles,
    memory,
    inbox,
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

// Inbox
export function getAllInbox(): InboxNote[] {
  return loadContent().inbox;
}

export function getInboxBySlug(slug: string): InboxNote | null {
  const item = loadContent().bySlug[slug];
  return item && "date" in item ? (item as InboxNote) : null;
}

// Unified
/** Resolve a wikilink target slug (or memory alias) to a site href. */
export function resolveWikilinkHref(target: string): string | null {
  const slug = target.trim();
  if (getMemoryBySlug(slug)) return `/m/${slug}`;
  if (getArticleBySlug(slug)) return `/k/${slug}`;
  if (getInboxBySlug(slug)) return `/d/${slug}`;
  const aliased = getAllMemory().find((n) => n.aliases.includes(slug));
  return aliased ? `/m/${aliased.slug}` : null;
}

export function getAllContent(): ContentItem[] {
  return [
    ...loadContent().articles,
    ...loadContent().memory,
    ...loadContent().inbox,
  ];
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
