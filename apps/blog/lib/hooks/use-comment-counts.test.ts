import type { Post } from "@duyet/interfaces";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useCommentCounts } from "./use-comment-counts";

function post(slug: string, hackerNews?: string): Post {
  return {
    slug,
    title: "A post",
    date: new Date("2026-01-15T00:00:00Z"),
    category: "Engineering",
    category_slug: "engineering",
    tags: [],
    tags_slug: [],
    featured: false,
    hackerNews,
  } as Post;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCommentCounts", () => {
  test("starts empty and fills in once the venue answers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ descendants: 28 }) }))
    );

    const { result } = renderHook(() =>
      useCommentCounts([
        post("/2026/09/hook", "https://news.ycombinator.com/item?id=70001"),
      ])
    );

    // Nothing before the promise settles: the prerendered row ships as-is.
    expect(result.current).toEqual({});

    await waitFor(() => {
      expect(result.current["/2026/09/hook"]).toBe(28);
    });
  });

  test("stays empty when the venue is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      })
    );

    const { result } = renderHook(() =>
      useCommentCounts([
        post("/2026/09/offline", "https://news.ycombinator.com/item?id=70002"),
      ])
    );

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalled();
    });
    expect(result.current).toEqual({});
  });

  test("aborts in-flight reads on unmount", async () => {
    const signals: AbortSignal[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        signals.push(init?.signal as AbortSignal);
        return { ok: true, json: async () => ({ descendants: 4 }) };
      })
    );

    const { unmount } = renderHook(() =>
      useCommentCounts([
        post("/2026/09/unmount", "https://news.ycombinator.com/item?id=70003"),
      ])
    );
    unmount();

    expect(signals[0]?.aborted).toBe(true);
  });
});
