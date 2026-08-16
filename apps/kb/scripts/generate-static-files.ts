#!/usr/bin/env tsx
/**
 * Prebuild script: walks the git submodule content and generates static files
 * served as-is by Cloudflare Pages.
 *
 * Outputs:
 * - public/robots.txt
 * - public/sitemap.xml
 * - public/llms.txt
 * - public/llms-full.txt
 * - public/k/<slug>.md        (raw markdown for every article)
 * - public/m/<slug>.md        (raw markdown for every memory note)
 * - public/d/<date>.md        (raw markdown for every inbox daily note)
 * - public/graph-data.json    (nodes + edges for the knowledge graph)
 *
 * This script is self-contained — it does NOT import lib/content.ts so
 * the runtime loader can stay Vite-only (import.meta.glob).
 */

import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join } from "node:path";
import matter from "gray-matter";

const SCRIPT_DIR = import.meta.dirname!;
const APP_DIR = join(SCRIPT_DIR, "..");
const ARTICLES_DIR = join(APP_DIR, "kb", "raw", "kb-content");
const MEMORY_DIR = join(APP_DIR, "kb", "memory");
const INBOX_DIR = join(APP_DIR, "kb", "raw", "inbox");
const PUBLIC_DIR = join(APP_DIR, "public");
const PUBLIC_K_DIR = join(PUBLIC_DIR, "k");
const PUBLIC_M_DIR = join(PUBLIC_DIR, "m");
const PUBLIC_D_DIR = join(PUBLIC_DIR, "d");
const SITE_URL = "https://kb.duyet.net";

mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(PUBLIC_K_DIR, { recursive: true });
mkdirSync(PUBLIC_M_DIR, { recursive: true });
mkdirSync(PUBLIC_D_DIR, { recursive: true });

// ── Helpers ───────────────────────────────────────────────────────────────────

interface Article {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  links: string[];
  summary: string;
  updated: string;
  raw: string;
}

interface MemoryNote {
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

interface InboxNote {
  slug: string;
  date: string;
  title: string;
  links: string[];
  raw: string;
}

function extractWikilinks(md: string): string[] {
  const found = new Set<string>();
  const re = /\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]/g;
  let match: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex-exec loop
  while ((match = re.exec(md))) {
    const target = match[1].trim();
    if (target) found.add(target);
  }
  return [...found];
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

const slugify = (s: string) =>
  String(s)
    .toLowerCase()
    .replace(/\[\[|\]\]/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ── Walk articles ────────────────────────────────────────────────────────────

const articles: Article[] = [];
const categories = new Set<string>();

for (const filePath of walkMd(ARTICLES_DIR)) {
  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const slug = basename(filePath, ".md");
  const article: Article = {
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
  articles.push(article);
  categories.add(article.category);
}

articles.sort((a, b) => {
  if (a.updated && b.updated) return b.updated.localeCompare(a.updated);
  if (a.updated) return -1;
  if (b.updated) return 1;
  return a.title.localeCompare(b.title);
});

// ── Walk memory notes ─────────────────────────────────────────────────────────

const memory: MemoryNote[] = [];
const memoryTypes = new Set<string>();

for (const filePath of walkMd(MEMORY_DIR)) {
  const slug = basename(filePath, ".md");
  if (slug.startsWith("_") || slug === "index" || slug === "log") continue;

  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const related = (Array.isArray(data.related) ? data.related : []).map(
    (r: string) => r.replace(/^\[\[/, "").replace(/\]\]$/, "").trim(),
  );

  const note: MemoryNote = {
    slug,
    name: typeof data.name === "string" ? data.name : slug,
    title:
      typeof data.title === "string"
        ? data.title
        : typeof data.name === "string"
          ? data.name
          : slug,
    description: typeof data.description === "string" ? data.description : "",
    memoryType: typeof data.type === "string" ? data.type : "reference",
    category: typeof data.category === "string" ? data.category : "general",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    related,
    sources: Array.isArray(data.sources) ? data.sources.map(String) : [],
    aliases: Array.isArray(data.aliases) ? data.aliases.map(String) : [],
    created: typeof data.created === "string" ? data.created : "",
    updated: typeof data.updated === "string" ? data.updated : "",
    timestamp: typeof data.timestamp === "string" ? data.timestamp : "",
    raw: content.trim(),
  };
  memory.push(note);
  memoryTypes.add(note.memoryType);
}

// ── Walk inbox daily notes ────────────────────────────────────────────────────

const inbox: InboxNote[] = [];

for (const filePath of walkMd(INBOX_DIR)) {
  const slug = basename(filePath, ".md");
  if (slug.startsWith("_")) continue;

  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const body = content.trim();
  const headingMatch = body.match(/^#\s+(.+)$/m);

  inbox.push({
    slug,
    date: slug,
    title:
      typeof data.title === "string"
        ? data.title
        : (headingMatch?.[1]?.trim() ?? `Inbox ${slug}`),
    links: extractWikilinks(body),
    raw: body,
  });
}

inbox.sort((a, b) => b.date.localeCompare(a.date));

console.log(
  `generate-static-files: ${articles.length} articles, ${memory.length} memory notes, ${inbox.length} inbox notes, ${categories.size} categories`,
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

const urlEntries: string[] = [`  <url>\n    <loc>${SITE_URL}/</loc>\n  </url>`];

for (const cat of [...categories].sort()) {
  urlEntries.push(
    `  <url>\n    <loc>${SITE_URL}/c/${encodeURIComponent(cat)}</loc>\n  </url>`,
  );
}

for (const article of articles) {
  const lastmod = article.updated
    ? `\n    <lastmod>${article.updated}</lastmod>`
    : "";
  urlEntries.push(
    `  <url>\n    <loc>${SITE_URL}/k/${encodeURIComponent(article.slug)}</loc>${lastmod}\n  </url>`,
  );
}

urlEntries.push(
  `  <url>\n    <loc>${SITE_URL}/m</loc>\n  </url>`,
);

for (const note of memory) {
  const lastmod = note.updated
    ? `\n    <lastmod>${note.updated}</lastmod>`
    : "";
  urlEntries.push(
    `  <url>\n    <loc>${SITE_URL}/m/${encodeURIComponent(note.slug)}</loc>${lastmod}\n  </url>`,
  );
}

urlEntries.push(`  <url>\n    <loc>${SITE_URL}/d</loc>\n  </url>`);

for (const note of inbox) {
  urlEntries.push(
    `  <url>\n    <loc>${SITE_URL}/d/${encodeURIComponent(note.slug)}</loc>\n    <lastmod>${note.date}</lastmod>\n  </url>`,
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
  `${articles.length} articles across ${categories.size} categories, ${memory.length} memory notes, ${inbox.length} inbox notes.`,
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

llmsLines.push("## Memory");
llmsLines.push("");

for (const note of memory) {
  llmsLines.push(`### ${note.title}`);
  llmsLines.push(`URL: ${SITE_URL}/m/${note.slug}`);
  llmsLines.push(`Markdown: ${SITE_URL}/m/${note.slug}.md`);
  llmsLines.push(`Type: ${note.memoryType}`);
  if (note.updated) llmsLines.push(`Updated: ${note.updated}`);
  if (note.description) llmsLines.push(`Description: ${note.description}`);
  llmsLines.push("");
}

llmsLines.push("## Inbox");
llmsLines.push("");

for (const note of inbox) {
  llmsLines.push(`### ${note.title}`);
  llmsLines.push(`URL: ${SITE_URL}/d/${note.slug}`);
  llmsLines.push(`Markdown: ${SITE_URL}/d/${note.slug}.md`);
  llmsLines.push(`Date: ${note.date}`);
  llmsLines.push("");
}

writeFileSync(join(PUBLIC_DIR, "llms.txt"), llmsLines.join("\n"), "utf-8");
console.log("  llms.txt");

// ── llms-full.txt ────────────────────────────────────────────────────────────

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

for (const note of memory) {
  fullLines.push(`# ${note.title}`);
  fullLines.push(`URL: ${SITE_URL}/m/${note.slug}`);
  fullLines.push(`Type: ${note.memoryType}`);
  if (note.updated) fullLines.push(`Updated: ${note.updated}`);
  if (note.description) fullLines.push(`Description: ${note.description}`);
  fullLines.push("");
  fullLines.push(note.raw);
  fullLines.push("");
  fullLines.push("---");
  fullLines.push("");
}

for (const note of inbox) {
  fullLines.push(`# ${note.title}`);
  fullLines.push(`URL: ${SITE_URL}/d/${note.slug}`);
  fullLines.push(`Date: ${note.date}`);
  fullLines.push("");
  fullLines.push(note.raw);
  fullLines.push("");
  fullLines.push("---");
  fullLines.push("");
}

writeFileSync(
  join(PUBLIC_DIR, "llms-full.txt"),
  fullLines.join("\n"),
  "utf-8",
);
console.log("  llms-full.txt");

// ── public/k/<slug>.md (raw per-article markdown) ────────────────────────────

for (const article of articles) {
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
  writeFileSync(
    join(PUBLIC_K_DIR, `${article.slug}.md`),
    `${frontmatter}${article.raw}\n`,
    "utf-8",
  );
}
console.log(`  k/<slug>.md × ${articles.length}`);

// ── public/m/<slug>.md (raw per-note markdown) ───────────────────────────────

for (const note of memory) {
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
  writeFileSync(
    join(PUBLIC_M_DIR, `${note.slug}.md`),
    `${frontmatter}${note.raw}\n`,
    "utf-8",
  );
}
console.log(`  m/<slug>.md × ${memory.length}`);

// ── public/d/<date>.md (raw per-note markdown for inbox daily notes) ────────

for (const note of inbox) {
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
  writeFileSync(
    join(PUBLIC_D_DIR, `${note.slug}.md`),
    `${frontmatter}${note.raw}\n`,
    "utf-8",
  );
}
console.log(`  d/<date>.md × ${inbox.length}`);

// ── public/graph-data.json (knowledge graph) ─────────────────────────────────

interface GraphNode {
  id: string;
  label: string;
  kind: "article" | "memory" | "inbox" | "tag";
  memoryType?: string;
  href: string;
  tags: string[];
  description: string;
  updated: string;
}

interface GraphEdge {
  source: string;
  target: string;
  kind: "link" | "tag";
}

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
    }),
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
    }),
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
    }),
  ),
];

const edgeKeys = new Set<string>();
const edges: GraphEdge[] = [];
const addEdge = (source: string, target: string, kind: "link" | "tag") => {
  if (source === target) return;
  const key = `${kind}|${source}|${target}`;
  if (edgeKeys.has(key)) return;
  edgeKeys.add(key);
  edges.push({ source, target, kind });
};

// Link edges: frontmatter links/related + body wikilinks, directed source→target.
for (const a of articles) {
  const refs = new Set([...a.links, ...extractWikilinks(a.raw)]);
  for (const ref of refs) {
    const target = resolve.get(slugify(ref));
    if (target) addEdge(a.slug, target, "link");
  }
}
for (const n of memory) {
  const refs = new Set([...n.related, ...extractWikilinks(n.raw)]);
  for (const ref of refs) {
    const target = resolve.get(slugify(ref));
    if (target) addEdge(n.slug, target, "link");
  }
}
for (const d of inbox) {
  const refs = new Set([...d.links, ...extractWikilinks(d.raw)]);
  for (const ref of refs) {
    const target = resolve.get(slugify(ref));
    if (target) addEdge(d.slug, target, "link");
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

const graphData = {
  generated: new Date().toISOString(),
  nodes: [...nodes, ...tagNodes.values()],
  edges,
};

writeFileSync(
  join(PUBLIC_DIR, "graph-data.json"),
  JSON.stringify(graphData),
  "utf-8",
);
console.log(
  `  graph-data.json (${graphData.nodes.length} nodes, ${graphData.edges.length} edges)`,
);

console.log("generate-static-files: done");
