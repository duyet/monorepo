import type { Post } from "@duyet/interfaces";
import { render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { PostList } from "./PostList";

// The `@duyet/components` barrel re-exports `@duyet/libs`, whose `string.ts`
// dynamically imports the built `@duyet/wasm` output, and the unit-test job
// does not build WASM. PostList only wants `Eyebrow` from the barrel and
// nothing below asserts on its markup, so stub just that.
vi.mock("@duyet/components", () => ({
  Eyebrow: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

function post(
  slug: string,
  links: Partial<Pick<Post, "hackerNews" | "x">> = {}
): Post {
  return {
    slug,
    title: `Post ${slug}`,
    date: new Date("2026-01-15T00:00:00Z"),
    category: "Engineering",
    category_slug: "engineering",
    tags: [],
    tags_slug: [],
    featured: false,
    readingTime: 5,
    ...links,
  } as Post;
}

function renderList(posts: Post[]) {
  return render(
    <PostList
      filteredPosts={posts}
      childrenByParent={{}}
      activeCategory="All"
      categories={[{ name: "Engineering", count: posts.length }]}
      setActiveCategory={() => {}}
      totalPosts={posts.length}
    />
  );
}

function stubHackerNews(descendants: number | undefined) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => (descendants === undefined ? {} : { descendants }),
    }))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * The count is a progressive enhancement: the row ships without it and the
 * number only joins the category and token pills once the thread answers.
 */
describe("comment counts in the post rows", () => {
  test("adds the total next to the token count, after hydration", async () => {
    stubHackerNews(28);
    const { container } = renderList([
      post("/2026/09/a", {
        hackerNews: "https://news.ycombinator.com/item?id=80001",
      }),
    ]);

    // Before the promise settles: category and tokens only.
    expect(container.textContent).toContain("1.0k tok");
    expect(container.querySelector("[title]")).toBeNull();

    await waitFor(() => {
      expect(container.textContent).toContain("28");
    });
    const pill = container.querySelector("[title='28 comments']");
    expect(pill?.textContent).toBe("28");
    // Sits after the category pill and the token pill, inside the right cell.
    const cell = pill?.parentElement;
    expect(cell?.lastElementChild).toBe(pill);
    expect(cell?.textContent).toContain("Engineering");
    expect(cell?.textContent).toContain("1.0k tok");
  });

  test("leaves a post with no discussion exactly as it was", async () => {
    stubHackerNews(28);
    const fetchMock = vi.mocked(fetch);
    const { container } = renderList([post("/2026/01/b")]);

    await waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalled();
    });
    expect(container.textContent).toContain("1.0k tok");
    expect(container.querySelector("[title]")).toBeNull();
  });

  test("leaves a post with a comment-less thread exactly as it was", async () => {
    stubHackerNews(undefined);
    const { container } = renderList([
      post("/2026/07/c", {
        hackerNews: "https://news.ycombinator.com/item?id=80002",
      }),
    ]);

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalled();
    });
    expect(container.querySelector("[title]")).toBeNull();
  });
});
