import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import sanitizeHtml from "sanitize-html";
import { unified } from "unified";

const __dirname = dirname(fileURLToPath(import.meta.url));

let _markdownToHtml: ((input: string) => string) | null = null;

async function ensureWasmInit() {
  if (_markdownToHtml) return;
  const { initSync, markdown_to_html } = await import(
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
 * Post-process HTML with rehype for syntax highlighting and KaTeX rendering.
 */
async function postProcessHtml(html: string): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeHighlight, { detect: true })
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
