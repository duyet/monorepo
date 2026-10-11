/**
 * Pure parsing helpers for shortform notes, shared by the Vite-side loader
 * (`lib/shortforms.ts`) and the two prebuild scripts that read `_shortforms/`
 * off disk (`scripts/generate-static-files.ts`, `scripts/generate-og.ts`).
 * Keep this file free of Vite-only APIs (e.g. `import.meta.glob`) and of
 * `node:fs` so all three consumers can import it directly — sharing the file
 * filter, slug logic, and embed rewriting is what keeps the generated
 * `.md`/sitemap/OG-card URLs in lockstep with the live `/note/$id` routes.
 *
 * Three copies of the `*.md` filter had already drifted: a note one consumer
 * accepted and another dropped would get a live page with no `.md` export, or
 * an OG card for a page that 404s.
 */

import { splitFrontmatter } from "@duyet/libs/frontmatter";

export interface ParsedFrontmatter {
  date: string
  title?: string
  slug?: string
  /** Discussion thread. Absent when the note has none. */
  x?: string
  hackerNews?: string
  body: string
}

/** A quick note, before any consumer-specific date coercion. */
export interface RawShortform {
  id: string;
  title?: string;
  /** Raw `date:` frontmatter value — callers decide how to parse it. */
  date: string;
  x?: string;
  hackerNews?: string;
  body: string;
  excerpt: string;
}

/**
 * Parse the minimal frontmatter used in shortforms (`date:`, optional `title:`/`slug:`).
 *
 * The fence split is shared with `apps/kb` (`lib/content.ts` and
 * `lib/markdown.ts`), which had two more copies that had drifted. YAML
 * parsing stays inline: shortforms are a documented three-key shape, and
 * pulling in an engine for them would add weight to the Vite bundle.
 *
 * The three `^key:` matches below handle the documented shape only — a quoted
 * value keeps its quotes, and a list or nested key is not a match. That is
 * unchanged behaviour, not an oversight; the shared fence is what guarantees
 * *where* the block starts and ends, which is the part that used to disagree
 * between apps.
 */
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const split = splitFrontmatter(raw)
  if (!split) {
    return { date: '', body: raw.trim() }
  }
  const fm = split.frontmatter
  const dateMatch = fm.match(/^date:\s*(.+)$/m)
  const titleMatch = fm.match(/^title:\s*(.+)$/m)
  const slugMatch = fm.match(/^slug:\s*(.+)$/m)
  const xMatch = fm.match(/^x:\s*(.+)$/m)
  const hnMatch = fm.match(/^hackerNews:\s*(.+)$/m)
  return {
    date: dateMatch ? dateMatch[1].trim() : '',
    title: titleMatch ? titleMatch[1].trim() : undefined,
    slug: slugMatch ? slugMatch[1].trim() : undefined,
    ...(xMatch ? { x: xMatch[1].trim() } : {}),
    ...(hnMatch ? { hackerNews: hnMatch[1].trim() } : {}),
    body: split.body.trim(),
  }
}

import { slugify as sharedSlugify } from "@duyet/libs/slugify";

/** URL-safe id from a filename when no explicit `slug:` is set. */
export function slugify(name: string): string {
  return sharedSlugify(name, { mode: "collapse" });
}

/** Plain-text preview: drop images/embeds, unwrap links, strip markdown punctuation. */
export function toExcerpt(body: string): string {
  return body
    .replace(/!\[\[[^\]]*\]\]/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^[>#\-*\s]+/gm, '')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})-(.+)$/

/** Resolve a note's URL id from its explicit slug or `YYYY-MM-DD-slug` filename. */
export function shortformId(filename: string, slug?: string): string {
  if (slug) return slug
  const dated = filename.match(DATE_PREFIX)
  return slugify(dated ? dated[2] : filename)
}

/**
 * Is this `_shortforms/` directory entry a quick note?
 *
 * Matches `import.meta.glob('/_shortforms/*.md')` on the Vite side: top-level
 * markdown only (not `attachments/`, not nested dirs), excluding the folder's
 * own `README.md` scaffold.
 */
export function isShortformFile(filename: string): boolean {
  return filename.endsWith('.md') && filename.toLowerCase() !== 'readme.md'
}

const EMBED = /!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g

/** Convert Obsidian embeds `![[file.png]]` / `![[file.png|alt]]` to markdown images. */
export function resolveEmbeds(
  body: string,
  resolveUrl: (filename: string) => string | undefined,
): string {
  return body.replace(EMBED, (whole, file: string, alt?: string) => {
    const url = resolveUrl(file.trim())
    if (!url) return whole
    return `![${(alt ?? file).trim()}](${url})`
  })
}

/**
 * Parse one note file into its id, body, and excerpt.
 *
 * `filename` is the bare path (`2026-06-08-ax.md`) and `resolveUrl` maps an
 * attachment filename to the URL that consumer can serve it from — Vite's
 * hashed asset URL in the browser, `/media/notes/<file>` in the prebuild.
 * An embed whose attachment cannot be resolved is left verbatim, matching the
 * previous per-consumer behaviour.
 */
export function parseShortform(
  filename: string,
  raw: string,
  resolveUrl: (filename: string) => string | undefined,
): RawShortform {
  const { date, title, slug, x, hackerNews, body } = parseFrontmatter(raw)
  const resolved = resolveEmbeds(body, resolveUrl)
  return {
    id: shortformId(filename.replace(/\.md$/, ''), slug),
    title,
    date,
    ...(x ? { x } : {}),
    ...(hackerNews ? { hackerNews } : {}),
    body: resolved,
    excerpt: toExcerpt(resolved),
  }
}
