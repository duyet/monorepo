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

    // Generate slug ID from text
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    headings.push({ id, text, level });
  });

  return headings;
}

export default extractHeadings;
