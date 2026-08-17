/**
 * Markdown-to-HTML transformer.
 *
 * Uses the unified/remark/rehype pipeline — same stack as apps/blog.
 * Synchronous where possible; async only because rehype-autolink-headings
 * requires the async unified().process() path.
 */

import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSlug)
  .use(rehypeHighlight, { detect: true, ignoreMissing: true })
  .use(rehypeStringify);

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await processor.process(markdown);
  return result.toString();
}

/** Resolve a wikilink target (slug) to an href, or null if unknown. */
export type WikilinkResolver = (target: string) => string | null;

/**
 * Obsidian-flavored markdown preprocessing:
 * - `[[target]]`, `[[target|label]]`, `[[target#heading]]` wikilinks become
 *   regular markdown links via `resolve` (unresolved targets render as plain
 *   label text instead of raw brackets)
 * - `==highlight==` becomes `<mark>`-style emphasis (rendered as bold)
 */
export function preprocessObsidian(
  markdown: string,
  resolve?: WikilinkResolver
): string {
  return markdown
    .replace(
      /\[\[([^\]|#]+)(#[^\]|]*)?(?:\|([^\]]+))?\]\]/g,
      (
        _m,
        target: string,
        fragment: string | undefined,
        label: string | undefined
      ) => {
        const t = target.trim();
        const text = (label ?? t).trim();
        const href = resolve?.(t) ?? null;
        return href ? `[${text}](${href}${fragment ?? ""})` : text;
      }
    )
    .replace(/==([^=\n]+)==/g, "**$1**");
}

/** Strip YAML frontmatter (handles CRLF, BOM, and missing trailing newline). */
export function stripFrontmatter(markdown: string): string {
  return markdown.replace(
    /^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|(?=\S)|$)/,
    ""
  );
}
