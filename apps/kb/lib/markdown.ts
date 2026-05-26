/**
 * Markdown-to-HTML transformer.
 *
 * Uses the unified/remark/rehype pipeline — same stack as apps/blog.
 * Synchronous where possible; async only because rehype-autolink-headings
 * requires the async unified().process() path.
 */

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
  .use(rehypeStringify);

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await processor.process(markdown);
  return result.toString();
}
