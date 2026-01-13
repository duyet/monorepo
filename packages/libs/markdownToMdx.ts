import type { VFileCompatible } from "vfile";

import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import sanitizeHtml from "sanitize-html";

export async function markdownToMdx(markdown: VFileCompatible) {
  const result = await unified()
    .use(remarkParse, { fragment: true })
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeFormat)
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  // Sanitize HTML to prevent XSS attacks
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
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "id", "aria-hidden", "focusable", "xmlns", "data-*"],
      a: ["href", "name", "target", "rel", "class", "id"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      svg: ["width", "height", "viewBox", "fill", "stroke", "class"],
      path: ["d", "fill", "stroke", "stroke-width", "class"],
      button: ["type", "class", "id"],
      input: ["type", "value", "checked", "class", "id"],
      select: ["class", "id", "value"],
      option: ["value", "selected"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
  });

  return sanitized;
}

export default markdownToMdx;