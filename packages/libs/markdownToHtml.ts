import type { VFileCompatible } from "vfile";

import { unified } from "unified";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkParse from "remark-parse";
import rehypeFormat from "rehype-format";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export async function markdownToHtml(markdown: VFileCompatible) {
  const result = await unified()
    .use(remarkParse, { fragment: true })
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeFormat)
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return result.toString();
}

export default markdownToHtml;
