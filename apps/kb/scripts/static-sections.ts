/**
 * One function per output of the prebuild static-file generator.
 *
 * `scripts/generate-static-files.ts` is the orchestrator: it walks the
 * submodule, then calls these in a fixed order and writes what they return.
 * Every emitter here is a pure function of its inputs, so what the committed
 * `public/` files contain can be asserted directly from fixture content
 * (`static-sections.test.ts`) without walking 261 markdown files.
 *
 * Deliberately dependency-free apart from `node:fs`/`node:path` and
 * `gray-matter` — it must evaluate under plain `tsx`, outside Vite. It does
 * NOT import `lib/content.ts`, whose `import.meta.glob` only exists in a
 * bundle.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import matter from "gray-matter";
import { kbSlugify } from "@duyet/libs/slugify";
import type { GraphEdge, GraphNode } from "../lib/graph-types";
import { fmString, fmStringList } from "../lib/frontmatter-fields";
import { extractWikilinks, normalizeRelatedRefs } from "../lib/wikilinks";

const slugify = kbSlugify;

export const SITE_URL = "https://kb.duyet.net";

export interface Article {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  links: string[];
  summary: string;
  updated: string;
  raw: string;
}

export interface MemoryNote {
  slug: string;
  name: string;
  title: string;
  description: string;
  memoryType: string;
  category: string;
  tags: string[];
  related: string[];
  sources: string[];
  aliases: string[];
  created: string;
  updated: string;
  timestamp: string;
  raw: string;
}

export interface InboxNote {
  slug: string;
  date: string;
  title: string;
  links: string[];
  raw: string;
}

export interface KbContent {
  articles: Article[];
  /** Distinct article categories, in first-seen order. Callers sort if needed. */
  categories: string[];
  memory: MemoryNote[];
  inbox: InboxNote[];
}

// ── Walk the submodule ────────────────────────────────────────────────────────

/** Recursively collect `.md` paths under `dir`; an unreadable dir yields `[]`. */
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

/**
 * Walks `kb/raw/kb-content` into articles, newest `updated` first (title as
 * tiebreak), and collects the distinct categories for the sitemap and llms.txt.
 *
 * Unlike the runtime loader, no slug is skipped here: the generator has always
 * emitted a `k/<slug>.md` for every file it found. Do not "fix" the asymmetry
 * without checking the committed output.
 */
export function walkArticles(dir: string): {
  articles: Article[];
  categories: string[];
} {
  const articles: Article[] = [];
  const categories = new Set<string>();

  for (const filePath of walkMd(dir)) {
    const raw = readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const slug = basename(filePath, ".md");
    const article: Article = {
      slug,
      title: fmString(data, "title", slug),
      category: fmString(data, "category", "uncategorized"),
      tags: fmStringList(data, "tags"),
      links: fmStringList(data, "links"),
      summary: fmString(data, "summary", ""),
      updated: fmString(data, "updated", ""),
      raw: content.trim(),
    };
    articles.push(article);
    categories.add(article.category);
  }

  articles.sort(byUpdatedThenTitle);
  return { articles, categories: [...categories] };
}

/**
 * Walks `kb/memory` into memory notes. Skips the `_`-prefixed template,
 * `index`, and `log` files.
 *
 * `memoryType` is the ONE field where this script and `lib/content.ts` must
 * disagree: the runtime loader validates `type` against the known set and
 * falls back to "reference", while the generator passes any string through so
 * the emitted `/m/<slug>.md` frontmatter and `graph-data.json` keep the
 * author's raw value. Do not "unify" these two.
 *
 * That divergence lives HERE, at the call site — not in the shared accessors.
 * `fmString` is a plain type guard and is shared with the runtime loader; only
 * what is done with its result differs. That is why the accessors could be
 * deduplicated without losing this.
 */
export function walkMemory(dir: string): MemoryNote[] {
  const memory: MemoryNote[] = [];

  for (const filePath of walkMd(dir)) {
    const slug = basename(filePath, ".md");
    if (slug.startsWith("_") || slug === "index" || slug === "log") continue;

    const raw = readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    memory.push({
      slug,
      name: fmString(data, "name", slug),
      title: fmString(data, "title", fmString(data, "name", slug)),
      description: fmString(data, "description", ""),
      memoryType: fmString(data, "type", "reference"),
      category: fmString(data, "category", "general"),
      tags: fmStringList(data, "tags"),
      related: normalizeRelatedRefs(data.related),
      sources: fmStringList(data, "sources"),
      aliases: fmStringList(data, "aliases"),
      created: fmString(data, "created", ""),
      updated: fmString(data, "updated", ""),
      timestamp: fmString(data, "timestamp", ""),
      raw: content.trim(),
    });
  }

  return memory;
}

/**
 * Walks `kb/raw/inbox` into daily notes, newest date first. The slug is the
 * date; the title falls back to the first `# heading` in the body.
 */
export function walkInbox(dir: string): InboxNote[] {
  const inbox: InboxNote[] = [];

  for (const filePath of walkMd(dir)) {
    const slug = basename(filePath, ".md");
    if (slug.startsWith("_")) continue;

    const raw = readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const body = content.trim();
    const headingMatch = body.match(/^#\s+(.+)$/m);

    inbox.push({
      slug,
      date: slug,
      title: fmString(data, "title", headingMatch?.[1]?.trim() ?? `Inbox ${slug}`),
      links: extractWikilinks(body),
      raw: body,
    });
  }

  inbox.sort((a, b) => b.date.localeCompare(a.date));
  return inbox;
}

/** Comparator shared with `lib/content.ts`: newest `updated` first, title as tiebreak. */
function byUpdatedThenTitle(
  a: { updated: string; title: string },
  b: { updated: string; title: string }
): number {
  if (a.updated && b.updated) return b.updated.localeCompare(a.updated);
  if (a.updated) return -1;
  if (b.updated) return 1;
  return a.title.localeCompare(b.title);
}

// ── public/robots.txt ─────────────────────────────────────────────────────────

/**
 * Emits `public/robots.txt`: allow everything, point at the sitemap, and
 * advertise the two llms.txt endpoints as comments.
 */
export function renderRobots(siteUrl: string = SITE_URL): string {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml

# LLM and AI agent resources
# llms.txt: ${siteUrl}/llms.txt
# llms-full.txt: ${siteUrl}/llms-full.txt
`;
}

// ── public/sitemap.xml ────────────────────────────────────────────────────────

/**
 * Emits `public/sitemap.xml`: `/` and `/search`, one entry per category
 * (sorted), one per article, `/m` plus one per memory note, then `/d` plus one
 * per daily note. `<lastmod>` is emitted only when the note carries an
 * `updated` date; daily notes always emit one, since their slug is the date.
 */
export function renderSitemap(
  { articles, categories, memory, inbox }: KbContent,
  siteUrl: string = SITE_URL
): string {
  const urlEntries: string[] = [
    `  <url>\n    <loc>${siteUrl}/</loc>\n  </url>`,
    `  <url>\n    <loc>${siteUrl}/search</loc>\n  </url>`,
  ];

  for (const cat of [...categories].sort()) {
    urlEntries.push(
      `  <url>\n    <loc>${siteUrl}/c/${encodeURIComponent(cat)}</loc>\n  </url>`
    );
  }

  for (const article of articles) {
    const lastmod = article.updated
      ? `\n    <lastmod>${article.updated}</lastmod>`
      : "";
    urlEntries.push(
      `  <url>\n    <loc>${siteUrl}/k/${encodeURIComponent(article.slug)}</loc>${lastmod}\n  </url>`
    );
  }

  urlEntries.push(`  <url>\n    <loc>${siteUrl}/m</loc>\n  </url>`);

  for (const note of memory) {
    const lastmod = note.updated
      ? `\n    <lastmod>${note.updated}</lastmod>`
      : "";
    urlEntries.push(
      `  <url>\n    <loc>${siteUrl}/m/${encodeURIComponent(note.slug)}</loc>${lastmod}\n  </url>`
    );
  }

  urlEntries.push(`  <url>\n    <loc>${siteUrl}/d</loc>\n  </url>`);

  for (const note of inbox) {
    urlEntries.push(
      `  <url>\n    <loc>${siteUrl}/d/${encodeURIComponent(note.slug)}</loc>\n    <lastmod>${note.date}</lastmod>\n  </url>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;
}

// ── public/llms.txt ───────────────────────────────────────────────────────────

/**
 * Emits `public/llms.txt`: a machine-readable index — the four top-level
 * pages, then one `### Title` block per article, memory note, and daily note.
 * `Summary:` and `Description:` lines are omitted when the field is empty.
 */
export function renderLlmsTxt(
  { articles, categories, memory, inbox }: KbContent,
  siteUrl: string = SITE_URL
): string {
  const lines: string[] = [
    "# duyet.net Knowledge Base",
    "",
    `URL: ${siteUrl}`,
    `Sitemap: ${siteUrl}/sitemap.xml`,
    `Raw Markdown: ${siteUrl}/k/<slug>.md`,
    "",
    `${articles.length} articles across ${categories.length} categories, ${memory.length} memory notes, ${inbox.length} inbox notes.`,
    "",
    "## Pages",
    "",
    `Graph: ${siteUrl}/ — interactive knowledge graph of all notes`,
    `About: ${siteUrl}/about — how this knowledge base is built (from the duyet/kb README)`,
    `Dream: ${siteUrl}/dream — memory consolidation protocol`,
    `Daily notes: ${siteUrl}/d`,
    "",
    "## Articles",
    "",
  ];

  for (const article of articles) {
    lines.push(`### ${article.title}`);
    lines.push(`URL: ${siteUrl}/k/${article.slug}`);
    lines.push(`Markdown: ${siteUrl}/k/${article.slug}.md`);
    lines.push(`Category: ${article.category}`);
    if (article.updated) lines.push(`Updated: ${article.updated}`);
    if (article.summary) lines.push(`Summary: ${article.summary}`);
    lines.push("");
  }

  lines.push("## Memory");
  lines.push("");

  for (const note of memory) {
    lines.push(`### ${note.title}`);
    lines.push(`URL: ${siteUrl}/m/${note.slug}`);
    lines.push(`Markdown: ${siteUrl}/m/${note.slug}.md`);
    lines.push(`Type: ${note.memoryType}`);
    if (note.updated) lines.push(`Updated: ${note.updated}`);
    if (note.description) lines.push(`Description: ${note.description}`);
    lines.push("");
  }

  lines.push("## Inbox");
  lines.push("");

  for (const note of inbox) {
    lines.push(`### ${note.title}`);
    lines.push(`URL: ${siteUrl}/d/${note.slug}`);
    lines.push(`Markdown: ${siteUrl}/d/${note.slug}.md`);
    lines.push(`Date: ${note.date}`);
    lines.push("");
  }

  return lines.join("\n");
}

// ── public/llms-full.txt ──────────────────────────────────────────────────────

/**
 * Emits `public/llms-full.txt`: every note body concatenated, articles first,
 * then memory notes, then daily notes, each introduced by its `# Title` header
 * and closed with a `---` rule. Order is the input order, so the caller's
 * `walkArticles`/`walkInbox` sorting is what orders the document.
 */
export function renderLlmsFull(
  { articles, memory, inbox }: KbContent,
  siteUrl: string = SITE_URL
): string {
  const lines: string[] = [
    "# duyet.net Knowledge Base — Full Content",
    "",
    `URL: ${siteUrl}`,
    "",
    "---",
    "",
  ];

  for (const article of articles) {
    lines.push(`# ${article.title}`);
    lines.push(`URL: ${siteUrl}/k/${article.slug}`);
    lines.push(`Category: ${article.category}`);
    if (article.updated) lines.push(`Updated: ${article.updated}`);
    if (article.summary) lines.push(`Summary: ${article.summary}`);
    lines.push("");
    lines.push(article.raw);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  for (const note of memory) {
    lines.push(`# ${note.title}`);
    lines.push(`URL: ${siteUrl}/m/${note.slug}`);
    lines.push(`Type: ${note.memoryType}`);
    if (note.updated) lines.push(`Updated: ${note.updated}`);
    if (note.description) lines.push(`Description: ${note.description}`);
    lines.push("");
    lines.push(note.raw);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  for (const note of inbox) {
    lines.push(`# ${note.title}`);
    lines.push(`URL: ${siteUrl}/d/${note.slug}`);
    lines.push(`Date: ${note.date}`);
    lines.push("");
    lines.push(note.raw);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

// ── public/{k,m,d}/<slug>.md (raw markdown per note) ──────────────────────────

/**
 * Renders one `public/k/<slug>.md` file: frontmatter plus the body, with a
 * trailing newline. `links:` is ALWAYS emitted (empty list when there are none)
 * because raw-markdown consumers read it; the other optional fields are
 * omitted when empty.
 */
export function renderArticleMarkdown(article: Article): string {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(article.title)}`,
    `category: ${JSON.stringify(article.category)}`,
    article.tags.length
      ? `tags: [${article.tags.map((t) => JSON.stringify(t)).join(", ")}]`
      : "",
    `links: [${article.links.map((link) => JSON.stringify(link)).join(", ")}]`,
    article.summary ? `summary: ${JSON.stringify(article.summary)}` : "",
    article.updated ? `updated: ${JSON.stringify(article.updated)}` : "",
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");
  return `${frontmatter}\n${article.raw}\n`;
}

/**
 * Renders one `public/m/<slug>.md` file. `related:` is re-emitted in
 * `[[wikilink]]` form, undoing the bracket stripping `walkMemory` applied.
 * Optional fields are omitted when empty, so `name`/`title`/`description`/
 * `type` are the only guaranteed keys.
 */
export function renderMemoryMarkdown(note: MemoryNote): string {
  const frontmatter = [
    "---",
    `name: ${JSON.stringify(note.name)}`,
    `title: ${JSON.stringify(note.title)}`,
    `description: ${JSON.stringify(note.description)}`,
    `type: ${JSON.stringify(note.memoryType)}`,
    note.category ? `category: ${JSON.stringify(note.category)}` : "",
    note.tags.length
      ? `tags: [${note.tags.map((t) => JSON.stringify(t)).join(", ")}]`
      : "",
    note.related.length
      ? `related: [${note.related.map((r) => JSON.stringify(`[[${r}]]`)).join(", ")}]`
      : "",
    note.sources.length
      ? `sources: [${note.sources.map((s) => JSON.stringify(s)).join(", ")}]`
      : "",
    note.aliases.length
      ? `aliases: [${note.aliases.map((a) => JSON.stringify(a)).join(", ")}]`
      : "",
    note.created ? `created: ${JSON.stringify(note.created)}` : "",
    note.updated ? `updated: ${JSON.stringify(note.updated)}` : "",
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");
  return `${frontmatter}\n${note.raw}\n`;
}

/** Renders one `public/d/<date>.md` file. `links:` is omitted when empty. */
export function renderInboxMarkdown(note: InboxNote): string {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(note.title)}`,
    `date: ${JSON.stringify(note.date)}`,
    note.links.length
      ? `links: [${note.links.map((l) => JSON.stringify(l)).join(", ")}]`
      : "",
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");
  return `${frontmatter}\n${note.raw}\n`;
}

// ── public/graph-data.json ────────────────────────────────────────────────────

/**
 * Builds the graph payload for `public/graph-data.json`: one node per article,
 * memory note, and daily note, plus one node per distinct tag, and edges from
 * declared refs (`links`/`related`) and body wikilinks resolved to existing
 * slugs, plus tag-membership edges. Self-edges and duplicates are dropped.
 *
 * `generated` is left to the caller: it is the one field that legitimately
 * differs between runs.
 */
export function buildGraphData({
  articles,
  memory,
  inbox,
}: KbContent): { nodes: GraphNode[]; edges: GraphEdge[] } {
  // Resolution map: slug | name | title | aliases → node id
  const resolve = new Map<string, string>();

  for (const a of articles) {
    resolve.set(a.slug, a.slug);
    resolve.set(slugify(a.slug), a.slug);
    resolve.set(slugify(a.title), a.slug);
  }
  for (const n of memory) {
    resolve.set(n.slug, n.slug);
    resolve.set(slugify(n.slug), n.slug);
    resolve.set(slugify(n.title), n.slug);
    resolve.set(slugify(n.name), n.slug);
    for (const alias of n.aliases) resolve.set(slugify(alias), n.slug);
  }
  for (const d of inbox) {
    resolve.set(d.slug, d.slug);
    resolve.set(slugify(d.slug), d.slug);
    resolve.set(slugify(d.title), d.slug);
  }

  const nodes: GraphNode[] = [
    ...articles.map(
      (a): GraphNode => ({
        id: a.slug,
        label: a.title,
        kind: "article",
        href: `/k/${a.slug}`,
        tags: a.tags,
        description: a.summary,
        updated: a.updated,
      })
    ),
    ...memory.map(
      (n): GraphNode => ({
        id: n.slug,
        label: n.title,
        kind: "memory",
        memoryType: n.memoryType,
        href: `/m/${n.slug}`,
        tags: n.tags,
        description: n.description,
        updated: n.updated,
      })
    ),
    ...inbox.map(
      (d): GraphNode => ({
        id: d.slug,
        label: d.title,
        kind: "inbox",
        href: `/d/${d.slug}`,
        tags: [],
        description: "",
        updated: d.date,
      })
    ),
  ];

  const edgeKeys = new Set<string>();
  const edges: GraphEdge[] = [];
  const addEdge = (
    source: string,
    target: string,
    kind: "link" | "tag"
  ): void => {
    if (source === target) return;
    const key = `${kind}|${source}|${target}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ source, target, kind });
  };

  // Link edges: frontmatter links/related + body wikilinks, resolved and directed
  // source→target. All three content types use the same shape, so one loop covers
  // them. `linkSources` is built here (not earlier) because `resolve` must be
  // complete before any ref is looked up.
  const linkSources: Array<{ slug: string; refs: string[] }> = [
    ...articles.map((a) => ({
      slug: a.slug,
      refs: [...new Set([...a.links, ...extractWikilinks(a.raw)])],
    })),
    ...memory.map((n) => ({
      slug: n.slug,
      refs: [...new Set([...n.related, ...extractWikilinks(n.raw)])],
    })),
    ...inbox.map((d) => ({
      slug: d.slug,
      refs: [...new Set([...d.links, ...extractWikilinks(d.raw)])],
    })),
  ];

  for (const { slug, refs } of linkSources) {
    for (const ref of refs) {
      const target = resolve.get(slugify(ref));
      if (target) addEdge(slug, target, "link");
    }
  }

  // Tag nodes + membership edges.
  const tagNodes = new Map<string, GraphNode>();
  for (const item of [...articles, ...memory]) {
    for (const tag of item.tags) {
      const tagId = `#${tag}`;
      if (!tagNodes.has(tagId)) {
        tagNodes.set(tagId, {
          id: tagId,
          label: `#${tag}`,
          kind: "tag",
          href: "",
          tags: [],
          description: "",
          updated: "",
        });
      }
      addEdge(item.slug, tagId, "tag");
    }
  }

  return { nodes: [...nodes, ...tagNodes.values()], edges };
}
