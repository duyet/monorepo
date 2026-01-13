import type { VFileCompatible } from "vfile";

import { unified } from "unified";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import rehypeFormat from "rehype-format";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import sanitizeHtml from "sanitize-html";

interface MarkdownToHtmlOptions {
  isMDX?: boolean;
}

export async function markdownToHtml(
  markdown: VFileCompatible,
  options: MarkdownToHtmlOptions = {}
) {
  const { isMDX = false } = options;

  const processor = unified()
    .use(remarkParse, { fragment: true });

  if (isMDX) {
    processor.use(remarkMdx);
  }

  processor
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeFormat)
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(markdown);

  // Sanitize HTML to prevent XSS attacks
  // For MDX, we need to be more permissive with certain patterns that allow interactive components
  const sanitized = sanitizeHtml(result.toString(), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "math",
      "semantics",
      "mrow",
      "mi",
      "mn",
      "mo",
      "mtext",
      "mfrac",
      "msup",
      "msub",
      "msubsup",
      "img",
      "svg",
      "path",
      "g",
      "circle",
      "rect",
      "line",
      "polyline",
      "polygon",
      // MDX component wrapper elements
      "div",
      "span",
      "section",
      "article",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "id", "aria-hidden", "focusable", "xmlns", "data-*"],
      a: ["href", "name", "target", "rel", "class", "id"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      svg: ["width", "height", "viewBox", "fill", "stroke", "class"],
      path: ["d", "fill", "stroke", "stroke-width", "class"],
      // Allow data attributes for interactivity
      div: ["class", "id", "data-*"],
      span: ["class", "id", "data-*"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
  });

  return sanitized;
}

export default markdownToHtml;
