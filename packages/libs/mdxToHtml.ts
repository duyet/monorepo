import type { VFileCompatible } from "vfile";

import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import sanitizeHtml from "sanitize-html";

/**
 * Converts MDX to HTML for static rendering
 * This is used for building static HTML from MDX files
 */
export async function mdxToHtml(mdx: VFileCompatible) {
  const result = await unified()
    .use(remarkParse, { fragment: true })
    .use(remarkMdx)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw) // Allow raw HTML from MDX JSX
    .use(rehypeHighlight, { detect: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeFormat)
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(mdx);

  // Sanitize HTML to prevent XSS attacks
  // Allow additional attributes needed for MDX components
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
      "div", // Allow div for component containers
      "span",
      "section",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "button",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "id", "aria-hidden", "focusable", "xmlns", "style", "data-*"],
      a: ["href", "name", "target", "rel", "class", "id"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      svg: ["width", "height", "viewBox", "fill", "stroke", "class"],
      path: ["d", "fill", "stroke", "stroke-width", "class"],
      div: ["class", "id", "data-*"],
      span: ["class", "id", "data-*"],
      button: ["type", "class", "disabled", "data-*"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
      img: ["http", "https", "data"],
    },
  });

  return sanitized;
}

/**
 * This function will be used to handle component registration
 * For now it returns placeholders - components will be processed separately
 */
export function processMdxComponents(content: string): {
  processedContent: string;
  componentData: Array<{ type: string; props: any }>;
} {
  // This is a simplified version that extracts component data
  // In a full implementation, we'd use MDX's runtime compilation
  const componentData: Array<{ type: string; props: any }> = [];

  // Find JSX components in the content
  // Pattern: <ComponentName prop1="value" prop2={value} />
  const jsxPattern = /<(\w+)([^>]*)\/>/g;
  let match;

  while ((match = jsxPattern.exec(content)) !== null) {
    const componentName = match[1];
    const propsString = match[2];

    // Simple prop parsing
    const props: any = {};
    const propMatches = propsString.matchAll(/(\w+)="([^"]*)"|(\w+)={([^}]*)}/g);

    for (const propMatch of propMatches) {
      if (propMatch[1] && propMatch[2]) {
        // String prop
        props[propMatch[1]] = propMatch[2];
      } else if (propMatch[3] && propMatch[4]) {
        // Object/array prop (JSON-like)
        try {
          props[propMatch[3]] = JSON.parse(propMatch[4]);
        } catch {
          // Keep as string if parsing fails
          props[propMatch[3]] = propMatch[4];
        }
      }
    }

    componentData.push({ type: componentName, props });
  }

  return {
    processedContent: content, // Keep original for now
    componentData,
  };
}