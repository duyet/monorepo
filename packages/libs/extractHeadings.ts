import type { Heading, PhrasingContent, Root } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { VFileCompatible } from "vfile";

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Replicate the heading-id slug produced by the Rust/WASM markdown renderer
 * (crates/markdown `slugify` + `inject_heading_ids`). The TOC ids MUST match
 * the rendered heading ids exactly, or anchor links and the scroll-spy
 * highlight break.
 *
 * Two non-obvious details mirror the Rust path:
 *  1. The renderer slugifies the *HTML-escaped* heading text, so `&` becomes
 *     `&amp;` and survives as the literal "amp" (e.g. "a & b" -> "a-amp-b").
 *  2. Only ASCII alphanumerics are kept; space/`-`/`_` map to `-`; everything
 *     else is dropped; runs of `-` collapse to one.
 */
function htmlEscape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(text: string): string {
  return htmlEscape(text.trim())
    .toLowerCase()
    .split("")
    .map((c) => {
      if (/[a-z0-9]/.test(c)) return c;
      if (c === " " || c === "-" || c === "_") return "-";
      return "";
    })
    .join("")
    .split("-")
    .filter((part) => part.length > 0)
    .join("-");
}

/**
 * Get text content from phrasing content nodes
 */
function getTextContent(children: PhrasingContent[]): string {
  return children
    .map((child) => {
      if ("value" in child) return child.value;
      if ("children" in child) return getTextContent(child.children);
      return "";
    })
    .join("");
}

/**
 * Extract headings from markdown/MDX source at build time
 * This avoids client-side DOM queries for Table of Contents
 */
export async function extractHeadings(
  markdown: VFileCompatible
): Promise<TOCItem[]> {
  const headings: TOCItem[] = [];
  const slugCounts = new Map<string, number>();
  let isFirstH1 = true;

  const tree = unified().use(remarkParse).parse(markdown) as Root;

  visit(tree, "heading", (node: Heading) => {
    const level = node.depth;

    // Only extract h1, h2, h3
    if (level > 3) return;

    // Get text content from heading
    const text = getTextContent(node.children).trim();

    if (!text) return;

    // Skip the first H1 (usually the title)
    if (level === 1 && isFirstH1) {
      isFirstH1 = false;
      return;
    }

    // Generate slug ID matching crates/markdown's inject_heading_ids. Duplicate
    // base slugs get a numeric suffix the same way the Rust renderer does:
    // first occurrence keeps the base, later ones become `base-2`, `base-3`, …
    const baseSlug = slugify(text);
    const seen = slugCounts.get(baseSlug);
    let id: string;
    if (seen === undefined) {
      slugCounts.set(baseSlug, 1);
      id = baseSlug;
    } else {
      const next = seen + 1;
      slugCounts.set(baseSlug, next);
      id = `${baseSlug}-${next}`;
    }

    headings.push({ id, text, level });
  });

  return headings;
}

export default extractHeadings;
