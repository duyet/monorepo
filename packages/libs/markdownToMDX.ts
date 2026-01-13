import { compile } from "@mdx-js/mdx";
import type { VFileCompatible } from "vfile";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import * as runtime from "react/jsx-runtime";

/**
 * Compiles MDX content to JSX
 *
 * @param markdown - MDX source content
 * @returns Compiled JSX as string
 */
export async function markdownToMDX(markdown: VFileCompatible): Promise<string> {
  const result = await compile(markdown, {
    outputFormat: "function-body",
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeKatex],
    development: false,
  });

  return String(result);
}

/**
 * Compiles MDX to JavaScript that can be evaluated
 *
 * @param markdown - MDX source content
 * @returns JavaScript source code with JSX
 */
export async function markdownToMDXJS(markdown: VFileCompatible): Promise<string> {
  const result = await compile(markdown, {
    outputFormat: "program",
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeKatex],
    development: false,
  });

  return String(result);
}

export default markdownToMDX;