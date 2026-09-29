#!/usr/bin/env tsx
/**
 * Prebuild script: walks the git submodule content and generates static files
 * served as-is by Cloudflare Pages.
 *
 * This file is orchestration only. Every emitter lives in
 * `./static-sections.ts` as a pure function, so what each committed output
 * contains is asserted in `static-sections.test.ts` from fixture content
 * rather than inferred from a 600-line script. The write order below is the
 * only ordering that matters; it is deliberately explicit.
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
 * It does NOT import lib/content.ts — the runtime loader is
 * `import.meta.glob`-based and cannot be evaluated outside Vite. The lib/
 * modules it does share (`graph-types.ts`, `wikilinks.ts`,
 * `frontmatter-fields.ts`) are dependency-free, so they evaluate identically
 * under plain Node.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildGraphData,
  type KbContent,
  renderArticleMarkdown,
  renderInboxMarkdown,
  renderLlmsFull,
  renderLlmsTxt,
  renderMemoryMarkdown,
  renderRobots,
  renderSitemap,
  walkArticles,
  walkInbox,
  walkMemory,
} from "./static-sections";

const SCRIPT_DIR = import.meta.dirname!;
const APP_DIR = join(SCRIPT_DIR, "..");
const ARTICLES_DIR = join(APP_DIR, "kb", "raw", "kb-content");
const MEMORY_DIR = join(APP_DIR, "kb", "memory");
const INBOX_DIR = join(APP_DIR, "kb", "raw", "inbox");
const PUBLIC_DIR = join(APP_DIR, "public");
const PUBLIC_K_DIR = join(PUBLIC_DIR, "k");
const PUBLIC_M_DIR = join(PUBLIC_DIR, "m");
const PUBLIC_D_DIR = join(PUBLIC_DIR, "d");

mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(PUBLIC_K_DIR, { recursive: true });
mkdirSync(PUBLIC_M_DIR, { recursive: true });
mkdirSync(PUBLIC_D_DIR, { recursive: true });

// ── Load the submodule ────────────────────────────────────────────────────────

const { articles, categories } = walkArticles(ARTICLES_DIR);
const content: KbContent = {
  articles,
  categories,
  memory: walkMemory(MEMORY_DIR),
  inbox: walkInbox(INBOX_DIR),
};

console.log(
  `generate-static-files: ${content.articles.length} articles, ${content.memory.length} memory notes, ${content.inbox.length} inbox notes, ${content.categories.length} categories`
);

// ── Emit ──────────────────────────────────────────────────────────────────────
// Write order is fixed: index files first, then per-note markdown, then the
// graph. Each block below is one function from ./static-sections.ts.

writeFileSync(join(PUBLIC_DIR, "robots.txt"), renderRobots(), "utf-8");
console.log("  robots.txt");

writeFileSync(
  join(PUBLIC_DIR, "sitemap.xml"),
  renderSitemap(content),
  "utf-8"
);
console.log("  sitemap.xml");

writeFileSync(join(PUBLIC_DIR, "llms.txt"), renderLlmsTxt(content), "utf-8");
console.log("  llms.txt");

writeFileSync(
  join(PUBLIC_DIR, "llms-full.txt"),
  renderLlmsFull(content),
  "utf-8"
);
console.log("  llms-full.txt");

for (const article of content.articles) {
  writeFileSync(
    join(PUBLIC_K_DIR, `${article.slug}.md`),
    renderArticleMarkdown(article),
    "utf-8"
  );
}
console.log(`  k/<slug>.md × ${content.articles.length}`);

for (const note of content.memory) {
  writeFileSync(
    join(PUBLIC_M_DIR, `${note.slug}.md`),
    renderMemoryMarkdown(note),
    "utf-8"
  );
}
console.log(`  m/<slug>.md × ${content.memory.length}`);

for (const note of content.inbox) {
  writeFileSync(
    join(PUBLIC_D_DIR, `${note.slug}.md`),
    renderInboxMarkdown(note),
    "utf-8"
  );
}
console.log(`  d/<date>.md × ${content.inbox.length}`);

const { nodes, edges } = buildGraphData(content);
writeFileSync(
  join(PUBLIC_DIR, "graph-data.json"),
  JSON.stringify({ generated: new Date().toISOString(), nodes, edges }),
  "utf-8"
);
console.log(`  graph-data.json (${nodes.length} nodes, ${edges.length} edges)`);

console.log("generate-static-files: done");
