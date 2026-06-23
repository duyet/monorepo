import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import sanitizeHtml from "sanitize-html";
import { unified } from "unified";

let _markdownToHtml: ((input: string) => string) | null = null;

/**
 * Widget fence extraction result.
 * Contains the pre-processed markdown and extracted widget metadata.
 */
export interface WidgetExtraction {
  markdown: string;
  widgets: Array<{
    id: string;
    path: string;
    height?: number;
  }>;
}

/**
 * Extract widget fences from markdown and replace with placeholder divs.
 *
 * Input:  ```widget\npath: ./widgets/chart.html\nheight: 400\n```
 * Output: <div data-widget-id="widget-0" data-widget-path="./widgets/chart.html" data-widget-height="400"></div>
 *
 * Widget fences are removed before WASM processing to avoid being converted
 * to code blocks. The placeholder divs survive sanitization and are replaced
 * with LiveWidget components during rendering.
 */
export function extractWidgetFences(markdown: string): WidgetExtraction {
  const widgets: WidgetExtraction["widgets"] = [];
  let widgetIndex = 0;

  // Match widget fence blocks: ```widget\npath: ...\nheight: ...\n```
  const widgetFenceRegex = /```widget\n([\s\S]*?)```/g;
  const processedMarkdown = markdown.replace(widgetFenceRegex, (match, content) => {
    const lines = content.trim().split("\n");
    let path = "";
    let height: number | undefined = undefined;

    // Parse widget metadata
    for (const line of lines) {
      const keyMatch = line.match(/^(\w+):\s*(.+)$/);
      if (keyMatch) {
        const [, key, value] = keyMatch;
        if (key === "path") path = value.trim();
        if (key === "height") height = parseInt(value, 10);
      }
    }

    if (!path) {
      // Invalid widget fence, return as-is (will be rendered as code block)
      return match;
    }

    const widgetId = `widget-${widgetIndex++}`;
    widgets.push({ id: widgetId, path, height });

    // Generate placeholder div with data attributes
    const attrs = [`data-widget-id="${widgetId}"`, `data-widget-path="${path}"`];
    if (height) attrs.push(`data-widget-height="${height}"`);

    return `<div ${attrs.join(" ")}></div>`;
  });

  return { markdown: processedMarkdown, widgets };
}

async function ensureWasmInit() {
  if (_markdownToHtml) return;
  // Node-only WASM bootstrap. Imports are dynamic and live inside this
  // function so the module never touches node:fs/path/url at load time —
  // otherwise the client bundle throws `fileURLToPath is not a function`
  // at import and aborts hydration. markdownToHtml runs at prerender only.
  const { readFileSync } = await import("node:fs");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const { initSync, markdown_to_html } = await import(
    /* @vite-ignore */
    "@duyet/wasm/pkg/markdown/markdown.js"
  );
  const wasmPath = join(__dirname, "../wasm/pkg/markdown/markdown_bg.wasm");
  const wasmBuffer = readFileSync(wasmPath);
  initSync({ module: wasmBuffer });
  _markdownToHtml = markdown_to_html;
}

/**
 * Sanitize HTML to prevent XSS while preserving KaTeX and highlight.js output.
 */
function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "del",
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
      img: [
        "src",
        "alt",
        "title",
        "width",
        "height",
        "loading",
        "class",
      ],
      svg: ["width", "height", "viewBox", "fill", "stroke", "class"],
      path: ["d", "fill", "stroke", "stroke-width", "class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

/**
 * Minimal highlight.js grammar for ```prompt fenced blocks.
 *
 * A "prompt" is the text you paste into a coding agent. We don't want it
 * syntax-highlighted like code — that mis-colours ordinary words (e.g. `test`,
 * `until`, `in`). The only token worth marking is the leading slash-command
 * (`/goal`, `/agent-loop:start`); everything else stays plain body text.
 *
 * `disableAutodetect` keeps this grammar out of auto-detection so it only
 * applies to blocks explicitly tagged ```prompt.
 */
function promptLanguage() {
  return {
    name: "prompt",
    disableAutodetect: true,
    case_insensitive: false,
    contains: [
      {
        // A slash-command at the start of a line: /goal, /agent-loop:start.
        // Anchored to line-start so file paths like @docs/business aren't hit.
        scope: "built_in",
        begin: /^\/[A-Za-z][\w:-]*/,
      },
    ],
  };
}

/**
 * Post-process HTML with rehype for syntax highlighting and KaTeX rendering.
 */
async function postProcessHtml(html: string): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeHighlight, {
      detect: true,
      languages: { prompt: promptLanguage },
    })
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(html);
  return result.toString();
}

/**
 * Convert markdown to HTML.
 *
 * Step 1: WASM (pulldown-cmark) — GFM tables, strikethrough, task lists,
 *         math ($...$, $$...$$), heading IDs, autolink headings.
 * Step 2: Sanitize HTML to prevent XSS.
 * Step 3: JS post-processing via rehype for syntax highlighting and KaTeX.
 */
export async function markdownToHtml(markdown: string) {
  await ensureWasmInit();
  const html = _markdownToHtml!(markdown);
  const safe = sanitize(html);
  return postProcessHtml(safe);
}

export default markdownToHtml;
