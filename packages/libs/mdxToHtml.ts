import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import sanitizeHtml from "sanitize-html";
import type { VFileCompatible } from "vfile";

/**
 * Process MDX content for rendering. This is different from markdownToHtml
 * as it preserves MDX component syntax for the client-side MDX renderer.
 *
 * For MDX posts, we:
 * 1. Extract frontmatter
 * 2. Process the content but preserve JSX/MDX syntax
 * 3. Return content that can be passed to MDX components
 */
export async function mdxToHtml(markdown: VFileCompatible) {
  // For MDX content, we use a different approach:
  // We process it with remark to get structure but keep MDX intact
  // The actual rendering happens client-side with @mdx-js/react

  const result = await unified()
    .use(remarkParse, { fragment: true })
    .use(remarkMath)
    .use(remarkGfm)
    // Stop before remarkRehype to keep some MDX structure
    .process(markdown);

  // Sanitize but be more permissive for MDX components
  // We'll allow common HTML and assume MDX components are safe
  const sanitized = sanitizeHtml(result.toString(), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "math", "semantics", "mrow", "mi", "mn", "mo", "mtext", "mfrac", "msup", "msub", "msubsup",
      "img", "svg", "path", "g", "circle", "rect", "line", "polyline", "polygon",
      // MDX component patterns
      "Component", // Allow component-like patterns
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "id", "aria-hidden", "focusable", "xmlns", "style"],
      a: ["href", "name", "target", "rel", "class", "id"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      svg: ["width", "height", "viewBox", "fill", "stroke", "class"],
      path: ["d", "fill", "stroke", "stroke-width", "class"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    // Important: Don't transform HTML or MDX syntax
    allowProtocolRelative: false,
  });

  return sanitized;
}

/**
 * Check if a file is MDX based on extension
 */
export function isMdxFile(filePath: string): boolean {
  return filePath.endsWith(".mdx");
}

/**
 * Extract MDX component names from content
 * This helps identify which components are used in a post
 */
export function extractMdxComponents(content: string): string[] {
  const componentRegex = /<([A-Z][a-zA-Z0-9]+)/g;
  const matches = content.match(componentRegex) || [];
  return [...new Set(matches.map(m => m.substring(1)))];
}