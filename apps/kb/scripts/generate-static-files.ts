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
 * - public/graph-data.json    (nodes + edges for 3D knowledge graph)
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
const PUBLIC_DIR = join(APP_DIR, "public");
const PUBLIC_K_DIR = join(PUBLIC_DIR, "k");
const PUBLIC_M_DIR = join(PUBLIC_DIR, "m");
const SITE_URL = "https://kb.duyet.net";

mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(PUBLIC_K_DIR, { recursive: true });
mkdirSync(PUBLIC_M_DIR, { recursive: true });

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
  raw: string;
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
  if (slug.startsWith("_")) continue;

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
    raw: content.trim(),
  };
  memory.push(note);
  memoryTypes.add(note.memoryType);
}

console.log(
  `generate-static-files: ${articles.length} articles, ${memory.length} memory notes, ${categories.size} categories`,
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
  `${articles.length} articles across ${categories.size} categories, ${memory.length} memory notes.`,
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

// ── public/graph-data.json (3D knowledge graph) ──────────────────────────────

// Build unified node list
interface GraphNode {
  id: string;
  label: string;
  url: string;
  type: "article" | "memory";
  tags: string[];
  degree: number;
}

interface GraphEdge {
  source: string;
  target: string;
  strong: boolean;
}

const allSlugs = new Set<string>();
for (const a of articles) allSlugs.add(a.slug);
for (const n of memory) allSlugs.add(n.slug);

// Resolution map: slug | name | title | aliases → node id
const resolve = new Map<string, string>();

const nodes: (GraphNode & {
  _related: string[];
  _aliases: string[];
})[] = [
  ...articles.map((a) => {
    const node = {
      id: a.slug,
      label: a.title,
      url: `/k/${a.slug}`,
      type: "article" as const,
      tags: a.tags,
      _related: a.links,
      _aliases: [a.title],
      degree: 0,
    };
    resolve.set(a.slug, a.slug);
    resolve.set(slugify(a.slug), a.slug);
    resolve.set(slugify(a.title), a.slug);
    for (const alias of node._aliases) resolve.set(slugify(alias), a.slug);
    return node;
  }),
  ...memory.map((n) => {
    const node = {
      id: n.slug,
      label: n.title,
      url: `/m/${n.slug}`,
      type: "memory" as const,
      tags: n.tags,
      _related: n.related,
      _aliases: [n.name, ...n.aliases],
      degree: 0,
    };
    resolve.set(n.slug, n.slug);
    resolve.set(slugify(n.slug), n.slug);
    resolve.set(slugify(n.title), n.slug);
    resolve.set(slugify(n.name), n.slug);
    for (const alias of node._aliases) resolve.set(slugify(alias), n.slug);
    return node;
  }),
];

// Strong edges from explicit frontmatter links
const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const edges = new Map<string, GraphEdge>();

for (const n of nodes) {
  for (const ref of n._related) {
    const target = resolve.get(slugify(ref));
    if (!target || target === n.id) continue;
    edges.set(edgeKey(n.id, target), {
      source: n.id,
      target,
      strong: true,
    });
  }
}

// Weak edges from shared tags (capped at 2 per node)
const TAG_NEIGHBOUR_CAP = 2;
const byTag = new Map<string, string[]>();
for (const n of nodes) {
  for (const t of n.tags) {
    const key = String(t).toLowerCase();
    if (!byTag.has(key)) byTag.set(key, []);
    byTag.get(key)!.push(n.id);
  }
}

const weakCount = new Map<string, number>();
for (const ids of byTag.values()) {
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i];
      const b = ids[j];
      const key = edgeKey(a, b);
      if (edges.has(key)) continue;
      if ((weakCount.get(a) || 0) >= TAG_NEIGHBOUR_CAP) continue;
      if ((weakCount.get(b) || 0) >= TAG_NEIGHBOUR_CAP) continue;
      edges.set(key, { source: a, target: b, strong: false });
      weakCount.set(a, (weakCount.get(a) || 0) + 1);
      weakCount.set(b, (weakCount.get(b) || 0) + 1);
    }
  }
}

// Degree = strong-edge count
for (const e of edges.values()) {
  if (!e.strong) continue;
  const srcNode = nodes.find((n) => n.id === e.source);
  const tgtNode = nodes.find((n) => n.id === e.target);
  if (srcNode) srcNode.degree++;
  if (tgtNode) tgtNode.degree++;
}

const graphData = {
  nodes: nodes.map(({ _related, _aliases, ...rest }) => rest),
  edges: [...edges.values()],
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
