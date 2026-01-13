import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import sanitizeHtml from "sanitize-html";

/**
 * Detects if content contains MDX component syntax
 */
export function hasMDXComponents(content: string): boolean {
  // Look for JSX-like component syntax
  const jsxPattern = /<[A-Z][a-zA-Z]*\s*[\s>]/;
  const importPattern = /import\s+.*from\s+['"].*['"]/;

  return jsxPattern.test(content) || importPattern.test(content);
}

/**
 * Processes MDX content and returns sanitized HTML
 * Handles MDX components by rendering them in the content
 */
export async function processMDXContentToHTML(mdxContent: string): Promise<string> {
  try {
    // Parse the MDX content and replace custom components with HTML equivalents
    return await renderMDXToHTML(mdxContent);
  } catch (error) {
    console.error("MDX processing failed:", error);
    // Fall back to regular markdown processing
    return await renderSimpleMarkdown(mdxContent);
  }
}

/**
 * Renders MDX content to HTML by replacing components with their HTML equivalents
 */
async function renderMDXToHTML(mdxContent: string): Promise<string> {
  // This is a simplified parser that handles our specific components
  // A production system would use a full MDX compiler with proper HTML generation

  let html = mdxContent;

  // Remove imports (we don't need them for static HTML)
  html = html.replace(/import\s+.*from\s+['"][^'"]+['"];?\s*/g, "");

  // Remove exports
  html = html.replace(/export\s+(const|default)\s+.*;?\s*/g, "");

  // Remove frontmatter if present (--- at start)
  html = html.replace(/^---\n[\s\S]*?\n---\n/, "");

  // Handle ToolComparison component
  // Convert from: <ToolComparison tools={[...]} />
  // To: HTML representation
  html = html.replace(/<ToolComparison\s+tools=\{([^}]+)\}\s*\/>/g, (match, toolsJson) => {
    try {
      // Try to parse the JSON-like object (this is simplified)
      // For actual use, components would need proper serialization
      return `
        <div class="mdx-tool-comparison">
          <div class="alert alert-info">
            <strong>ToolComparison Component:</strong> This would render a side-by-side comparison in a full React environment.
          </div>
        </div>
      `;
    } catch {
      return '<div class="mdx-placeholder">ToolComparison Component</div>';
    }
  });

  // Handle FeatureMatrix component
  html = html.replace(/<FeatureMatrix\s+tools=\{([^}]+)\}\s+features=\{([^}]+)\}\s*\/>/g, () => {
    return '<div class="mdx-placeholder">FeatureMatrix Component</div>';
  });

  // Handle WakaTimeChart component
  html = html.replace(/<WakaTimeChart\s+data=\{([^}]+)\}\s*\/>/g, () => {
    return '<div class="mdx-placeholder">WakaTimeChart Component</div>';
  });

  // Handle ToolTimeline component
  html = html.replace(/<ToolTimeline\s+events=\{([^}]+)\}\s*\/>/g, () => {
    return '<div class="mdx-placeholder">ToolTimeline Component</div>';
  });

  // Handle WorkflowDiagram component
  html = html.replace(/<WorkflowDiagram\s+steps=\{([^}]+)\}\s*\/>/g, () => {
    return '<div class="mdx-placeholder">WorkflowDiagram Component</div>';
  });

  // Handle VersionDiff component
  html = html.replace(/<VersionDiff\s+lines=\{([^}]+)\}\s*\/>/g, () => {
    return '<div class="mdx-placeholder">VersionDiff Component</div>';
  });

  // Handle ToolList component
  html = html.replace(/<ToolList\s+tools=\{([^}]+)\}\s*\/>/g, () => {
    return '<div class="mdx-placeholder">ToolList Component</div>';
  });

  // Convert markdown to HTML first
  const { markdownToHtml } = await import("./markdownToHtml");
  const result = await markdownToHtml(html);

  // Sanitize the result
  return sanitizeHtml(result, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "div",
      "span",
      "section",
      "header",
      "footer",
      "article",
      "aside",
      "main",
      "nav",
      "figure",
      "figcaption",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
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
      svg: ["width", "height", "viewBox", "fill", "stroke", "class", "xmlns"],
      path: ["d", "fill", "stroke", "stroke-width", "class"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
  });
}

/**
 * Simple markdown to HTML conversion for fallback
 */
async function renderSimpleMarkdown(content: string): Promise<string> {
  const { markdownToHtml } = await import("./markdownToHtml");
  return await markdownToHtml(content);
}

/**
 * Get MDX component placeholders used in content
 */
export function getMDXComponentPlaceholders(content: string): string[] {
  const placeholders: string[] = [];

  const patterns = [
    /<ToolComparison[^>]*\/>/g,
    /<FeatureMatrix[^>]*\/>/g,
    /<WakaTimeChart[^>]*\/>/g,
    /<ToolTimeline[^>]*\/>/g,
    /<WorkflowDiagram[^>]*\/>/g,
    /<VersionDiff[^>]*\/>/g,
    /<ToolList[^>]*\/>/g,
  ];

  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      placeholders.push(...matches);
    }
  });

  return placeholders;
}