import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeFormat from "rehype-format";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import sanitizeHtml from "sanitize-html";
import { unified } from "unified";
import type { VFileCompatible } from "vfile";

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
      "*": ["class", "id", "aria-hidden", "focusable", "xmlns"],
      a: ["href", "name", "target", "rel", "class", "id"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      svg: ["width", "height", "viewBox", "fill", "stroke", "class"],
      path: ["d", "fill", "stroke", "stroke-width", "class"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
  });

  return sanitized;
}

export default markdownToHtml;
