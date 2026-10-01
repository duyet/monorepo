import type { Post } from "@duyet/interfaces";
import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchCommentCounts, type CommentSource } from "./comment-counts";

function post(
  links: Partial<Pick<Post, "hackerNews" | "x">> = {},
  slug = "/2026/01/a"
): Post {
  return {
    slug,
    title: "A post",
    date: new Date("2026-01-15T00:00:00Z"),
    category: "Engineering",
    category_slug: "engineering",
    tags: [],
    tags_slug: [],
    featured: false,
    ...links,
  } as Post;
}

/** A venue that counts a fixed total, so a test can tell two apart. */
function source(field: "hackerNews" | "x", count: number): CommentSource {
  return {
    field,
    resolveId: (url) => url,
    fetchCount: vi.fn(async () => count),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the Hacker News source", () => {
  test("reads the item id out of a thread link and counts that thread", async () => {
    const json = vi.fn(async () => ({ descendants: 28 }));
    const fetchMock = vi.fn(async () => ({ ok: true, json }));
    vi.stubGlobal("fetch", fetchMock);

    const counts = await fetchCommentCounts([
      post({ hackerNews: "https://news.ycombinator.com/item?id=49869107" }),
    ]);

    expect(counts["/2026/01/a"]).toBe(28);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://hacker-news.firebaseio.com/v0/item/49869107.json",
      expect.anything()
    );
  });

  test("counts a thread with no comments as zero, not a failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ dead: true }) }))
    );

    const counts = await fetchCommentCounts([
      post({ hackerNews: "https://news.ycombinator.com/item?id=1" }),
    ]);

    expect(counts).toEqual({});
  });

  test("leaves a post out when the venue cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      })
    );

    const counts = await fetchCommentCounts([
      post({ hackerNews: "https://news.ycombinator.com/item?id=2" }),
    ]);

    expect(counts).toEqual({});
  });

  test("does not refetch a thread it already counted", async () => {
    const json = vi.fn(async () => ({ descendants: 5 }));
    const fetchMock = vi.fn(async () => ({ ok: true, json }));
    vi.stubGlobal("fetch", fetchMock);

    const withLink = post(
      { hackerNews: "https://news.ycombinator.com/item?id=3" },
      "/2026/01/cached"
    );
    await fetchCommentCounts([withLink]);
    await fetchCommentCounts([withLink]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("summing venues", () => {
  test("adds up every venue that answers", async () => {
    const counts = await fetchCommentCounts(
      [post({ hackerNews: "https://news.ycombinator.com/item?id=9", x: "42" })],
      {
        sources: [source("hackerNews", 28), source("x", 3)],
      }
    );

    expect(counts["/2026/01/a"]).toBe(31);
  });

  test("skips a venue that cannot be read and keeps the other", async () => {
    const broken: CommentSource = {
      field: "x",
      resolveId: () => "42",
      fetchCount: async () => {
        throw new Error("rate limited");
      },
    };

    const counts = await fetchCommentCounts(
      [post({ hackerNews: "https://news.ycombinator.com/item?id=9", x: "42" })],
      { sources: [source("hackerNews", 28), broken] }
    );

    expect(counts["/2026/01/a"]).toBe(28);
  });

  test("ignores a link that carries no thread id", async () => {
    const counts = await fetchCommentCounts([
      post({ hackerNews: "https://news.ycombinator.com/newest" }),
    ]);

    expect(counts).toEqual({});
  });

  test("skips posts with no discussion link at all", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await fetchCommentCounts([post()])).toEqual({});
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
