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

interface MarkdownToHtmlOptions {
  isMdx?: boolean;
}

export async function markdownToHtml(
  markdown: VFileCompatible,
  options: MarkdownToHtmlOptions = {}
) {
  const { isMdx = false } = options;

  let processor = unified()
    .use(remarkParse, { fragment: true })
    .use(remarkMath);

  // Add MDX support if requested
  if (isMdx) {
    processor = processor.use(remarkMdx);
  }

  processor = processor
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
      // MDX/JSX elements
      "div",
      "span",
      "section",
      "article",
      "button",
      "input",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": [
        "class",
        "id",
        "aria-hidden",
        "focusable",
        "xmlns",
        "style",
        "data-*",
        "role",
      ],
      a: ["href", "name", "target", "rel", "class", "id"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      svg: ["width", "height", "viewBox", "fill", "stroke", "class", "xmlns"],
      path: ["d", "fill", "stroke", "stroke-width", "class"],
      button: ["onClick", "disabled", "type", "class"],
      input: ["type", "placeholder", "value", "disabled", "class"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowProtocolRelative: false,
  });

  return sanitized;
}

/**
 * Detect if content contains MDX syntax
 */
export function isMdxContent(content: string): boolean {
  const mdxPatterns = [
    /^import\s+.*\s+from\s+['"]/m,
    /^export\s+/m,
    /<([A-Z][A-Za-z0-9]*)[\s\S]*>/,
    /{.*}/,
  ];
  return mdxPatterns.some(pattern => pattern.test(content));
}

/**
 * Check file extension for MDX
 */
export function isMdxFile(filename: string): boolean {
  return filename.toLowerCase().endsWith(".mdx");
}

export default markdownToHtml;
