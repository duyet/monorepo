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
import remarkFrontmatter from "remark-frontmatter";
import sanitizeHtml from "sanitize-html";

interface MarkdownToHtmlOptions {
  /**
   * Enable MDX support. When true, processes MDX syntax.
   * When false (default), processes as regular Markdown.
   */
  mdx?: boolean;

  /**
   * File extension to determine processing mode automatically.
   * If provided, will override the mdx option.
   */
  extension?: string;
}

export async function markdownToHtml(
  markdown: VFileCompatible,
  options: MarkdownToHtmlOptions = {}
) {
  const { mdx = false, extension } = options;

  // Auto-detect MDX based on file extension if provided
  const enableMdx = extension?.toLowerCase().endsWith(".mdx") || mdx;

  // Create unified processor
  const processor = enableMdx
    ? unified()
        .use(remarkParse, { fragment: true })
        .use(remarkFrontmatter)
        .use(remarkMdx)
        .use(remarkMath)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeHighlight, { detect: true })
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings)
        .use(rehypeFormat)
        .use(rehypeKatex)
        .use(rehypeStringify, { allowDangerousHtml: true })
    : unified()
        .use(remarkParse, { fragment: true })
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
  const baseAllowedTags = sanitizeHtml.defaults.allowedTags.concat([
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
  ]);

  // MDX may require additional tags for component support
  const mdxAllowedTags = enableMdx
    ? baseAllowedTags.concat([
        "component",
        "Fragment",
        // Allow HTML-style tags that might be used in MDX
        "div",
        "span",
        "section",
        "article",
        "header",
        "footer",
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "strong",
        "em",
        "code",
        "pre",
        "blockquote",
        "hr",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
      ])
    : baseAllowedTags;

  const sanitized = sanitizeHtml(result.toString(), {
    allowedTags: mdxAllowedTags,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": [
        "class",
        "id",
        "aria-hidden",
        "focusable",
        "xmlns",
        "data-*",
        "style",
      ],
      a: ["href", "name", "target", "rel", "class", "id"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      svg: ["width", "height", "viewBox", "fill", "stroke", "class"],
      path: ["d", "fill", "stroke", "stroke-width", "class"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    // Allow dangerous HTML for MDX components that might be generated
    allowProtocolRelative: false,
  });

  return sanitized;
}

/**
 * Convenience function for processing MDX content
 */
export async function mdxToHtml(mdx: VFileCompatible) {
  return markdownToHtml(mdx, { mdx: true });
}

/**
 * Convenience function for processing standard Markdown content
 */
export async function markdownToHtmlStandard(markdown: VFileCompatible) {
  return markdownToHtml(markdown, { mdx: false });
}

export default markdownToHtml;
