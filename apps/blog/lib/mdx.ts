import { compile } from "@mdx-js/mdx";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export async function compileMDX(source: string) {
  try {
    const compiled = await compile(source, {
      outputFormat: "function-body",
      development: false,
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [rehypeKatex, rehypeHighlight],
    });

    return String(compiled);
  } catch (error) {
    console.error("MDX compilation error:", error);
    throw new Error(
      `Failed to compile MDX: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
