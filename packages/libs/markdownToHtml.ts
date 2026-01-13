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
import remarkMdx from "remark-mdx";
import sanitizeHtml from "sanitize-html";

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

/**
 * Parse MDX content and return the compiled source
 * This is used for MDX files that will be rendered as React components
 */
export async function mdxToHtml(mdx: VFileCompatible) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkMath)
    .use(remarkGfm)
    .process(mdx);

  return result.toString();
}

/**
 * Extract frontmatter from MDX or MD content
 */
export function extractFrontmatter(content: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const matter = require("gray-matter");
  return matter(content);
}

export default markdownToHtml;
