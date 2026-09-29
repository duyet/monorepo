import type { Post } from "@duyet/interfaces";
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { PostList } from "./PostList";

function post(tokenCount: number): Post {
  return {
    slug: "/2026/01/some-post",
    title: "Some post",
    date: new Date("2026-01-15T00:00:00Z"),
    category: "Engineering",
    category_slug: "engineering",
    tags: [],
    tags_slug: [],
    featured: false,
    tokenCount,
  } as Post;
}

function renderList(posts: Post[]) {
  return render(
    <PostList
      filteredPosts={posts}
      childrenByParent={{}}
      activeCategory="All"
      categories={[{ name: "All", count: posts.length }]}
      setActiveCategory={() => {}}
      totalPosts={posts.length}
    />
  );
}

// Covers the migration off the inline lowercase-k ternary onto the shared
// @duyet/libs helper. The blog token pill is the public surface that the
// consolidation must leave byte-identical, so it is pinned here.
describe("PostList token formatting", () => {
  test("renders a sub-1000 token count unformatted", () => {
    const { container } = renderList([post(999)]);
    expect(container.textContent).toContain("999 tok");
  });

  test("renders 1,500 tokens as 1.5k", () => {
    const { container } = renderList([post(1500)]);
    expect(container.textContent).toContain("1.5k tok");
  });

  test("renders 2,300,000 tokens with the m tier", () => {
    const { container } = renderList([post(2_300_000)]);
    expect(container.textContent).toContain("2.3m tok");
  });

  test("falls back to readingTime * 200 when tokenCount is missing", () => {
    const withoutTokens = {
      ...post(0),
      tokenCount: undefined,
      readingTime: 6,
    } as unknown as Post;
    // 6 reading minutes * 200 = 1200 -> "1.2k tok"
    const { container } = renderList([withoutTokens]);
    expect(container.textContent).toContain("1.2k tok");
  });
});
