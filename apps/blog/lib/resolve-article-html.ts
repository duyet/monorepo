import type { Post } from "@duyet/interfaces";
import { embedXPosts } from "./x-embed";

type ArticleSource = Post & {
  content?: string;
  isMDX?: boolean;
  html?: string;
};

/**
 * Static article HTML for prerender and hydrate. Prefer build-time `html`
 * so the page never waits on WASM/MDX compile. Client navigation falls back
 * to marked only when that payload is missing.
 */
export async function resolveArticleHtml(
  post: ArticleSource
): Promise<{ htmlContent: string; mdxSource?: string }> {
  const markdownContent = post.content || "";
  const mdxSource = post.isMDX ? markdownContent : undefined;

  let html = post.html || "";
  if (!html && markdownContent) {
    if (typeof window === "undefined") {
      const { markdownToHtml } = await import("@duyet/libs/markdownToHtml");
      html = await markdownToHtml(markdownContent);
    } else {
      console.warn(
        "posts-content missing html; using marked client fallback:",
        post.slug
      );
      const { marked } = await import("marked");
      html = String(await marked.parse(markdownContent));
    }
  }

  return {
    htmlContent: html ? embedXPosts(html) : "",
    mdxSource,
  };
}
