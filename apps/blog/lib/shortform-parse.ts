/**
 * Pure parsing helpers for shortform notes, shared by the Vite-side loader
 * (`lib/shortforms.ts`) and the prebuild static-file generator
 * (`scripts/generate-static-files.ts`). Keep this file free of Vite-only APIs
 * (e.g. `import.meta.glob`) so the Bun build script can import it directly —
 * sharing the slug logic is what keeps generated `.md`/sitemap URLs in lockstep
 * with the live `/note/$id` routes.
 */

export interface ParsedFrontmatter {
  date: string
  title?: string
  slug?: string
  body: string
}

/** Parse the minimal frontmatter used in shortforms (`date:`, optional `title:`/`slug:`). */
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { date: '', body: raw.trim() }
  }
  const [, fm, content] = match
  const dateMatch = fm.match(/^date:\s*(.+)$/m)
  const titleMatch = fm.match(/^title:\s*(.+)$/m)
  const slugMatch = fm.match(/^slug:\s*(.+)$/m)
  return {
    date: dateMatch ? dateMatch[1].trim() : '',
    title: titleMatch ? titleMatch[1].trim() : undefined,
    slug: slugMatch ? slugMatch[1].trim() : undefined,
    body: content.trim(),
  }
}

/** URL-safe id from a filename when no explicit `slug:` is set. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

/** Resolve a note's URL id from its explicit slug or its filename. */
export function shortformId(filename: string, slug?: string): string {
  return slug || slugify(filename)
}
