import type { Post } from "@duyet/interfaces";
import { describe, expect, it } from "vitest";
import { resolveArticleHtml } from "../resolve-article-html";

type PostContent = {
  content: string;
  isMDX?: boolean;
  html?: string;
};

function post(
  overrides: Partial<Post & PostContent> & Pick<PostContent, "content">
): Post & PostContent {
  return {
    slug: "/2026/08/grok-bot",
    title: "Grok Bot",
    date: new Date("2026-08-19"),
    category: "AI",
    category_slug: "ai",
    tags: [],
    tags_slug: [],
    featured: false,
    isMDX: false,
    ...overrides,
  };
}

describe("resolveArticleHtml", () => {
  it("uses prebuilt html so hydrate does not wait on markdown", async () => {
    const result = await resolveArticleHtml(
      post({ content: "# unused", html: "<p>Hello from prerender</p>" })
    );
    expect(result.htmlContent).toContain("Hello from prerender");
    expect(result.mdxSource).toBeUndefined();
  });

  it("returns mdxSource plus static html for MDX posts", async () => {
    const result = await resolveArticleHtml(
      post({
        isMDX: true,
        content: "hello **world**",
        html: "<p>hello <strong>world</strong></p>",
      })
    );
    expect(result.mdxSource).toBe("hello **world**");
    expect(result.htmlContent).toContain("hello");
    expect(result.htmlContent).toContain("strong");
  });
});
