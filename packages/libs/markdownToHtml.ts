import type { VFileCompatible } from "vfile";

import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import sanitizeHtml from "sanitize-html";

export async function markdownToHtml(markdown: VFileCompatible, isMDX = false) {
  if (isMDX) {
    const result = await unified()
      .use(remarkParse, { fragment: true })
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeHighlight, { detect: true })
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings)
      .use(rehypeFormat)
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
        "canvas",
        "script",
        "style",
        "div",
        "button",
        "input",
        "select",
        "option",
        "textarea",
        "form",
        "label",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        "*": ["class", "id", "aria-hidden", "focusable", "xmlns", "style"],
        a: ["href", "name", "target", "rel", "class", "id"],
        img: ["src", "alt", "title", "width", "height", "loading", "class"],
        svg: ["width", "height", "viewBox", "fill", "stroke", "class", "style"],
        path: ["d", "fill", "stroke", "stroke-width", "class", "style"],
        canvas: ["width", "height", "class", "style"],
        script: ["src", "type", "async", "defer"],
        style: ["type", "scoped"],
        div: ["className", "style"],
        button: ["className", "style", "type", "onClick"],
        input: ["className", "style", "type", "value", "onChange"],
        select: ["className", "style", "value", "onChange"],
        option: ["value"],
        textarea: ["className", "style", "value", "onChange"],
        form: ["className", "style", "onSubmit"],
        label: ["htmlFor", "className", "style"],
      },
      allowedSchemes: ["http", "https", "mailto", "data"],
    });

    return sanitized;
  } else {
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
}

export default markdownToHtml;
