import { useEffect, useState } from "react";
import type { Post } from "@duyet/interfaces";
import { fetchCommentCounts } from "@/lib/comment-counts";

/**
 * Comment totals per slug for `posts`, resolved after hydration.
 *
 * Empty until the discussion APIs answer, so the prerendered markup is what
 * ships and the totals only ever add to it. The effect re-runs when `posts`
 * changes (a category filter swap); cached threads answer from memory, so
 * that costs no network.
 */
export function useCommentCounts(posts: Post[]): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void fetchCommentCounts(posts, { signal: controller.signal }).then(
      (totals) => {
        if (active) setCounts(totals);
      }
    );
    return () => {
      active = false;
      controller.abort();
    };
  }, [posts]);

  return counts;
}
