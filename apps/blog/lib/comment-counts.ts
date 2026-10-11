import type { Post } from "@duyet/interfaces";

/**
 * Comment totals per post, summed across the discussion venues a post links
 * to in its frontmatter.
 *
 * Hacker News is the venue that answers today. Its Firebase item API is
 * public, sends `access-control-allow-origin: *`, and returns `descendants`
 * — the comment total for the whole thread, not just the top-level replies.
 *
 * X has no equivalent unauthenticated endpoint: the syndication API answers
 * with `access-control-allow-origin: https://platform.twitter.com`, so a
 * browser cannot read it and no X count can be read client-side. `SOURCES`
 * is the single place a venue is added once that changes, and a post's total
 * is whatever the venues that answered add up to.
 *
 * Everything here is a progressive enhancement. The blog prerenders fully
 * static HTML, and callers fetch only after hydration (see
 * `useCommentCounts`), so a slow or dead discussion API can never delay or
 * change first paint.
 */

const HN_ITEM_API = "https://hacker-news.firebaseio.com/v0/item";

/** One venue that can report a comment total for a post. */
export interface CommentSource {
  /** The `Post` field holding this venue's thread link. */
  readonly field: "hackerNews" | "x";
  /** The venue's thread id, or null when the link cannot be read. */
  resolveId(url: string): string | null;
  /** Total comments on that thread. Rejects when the venue is unreachable. */
  fetchCount(id: string, signal?: AbortSignal): Promise<number>;
}

const HACKER_NEWS: CommentSource = {
  field: "hackerNews",
  // "https://news.ycombinator.com/item?id=49869107" -> "49869107"
  resolveId: (url) => url.match(/[?&]id=(\d+)/)?.[1] ?? null,
  async fetchCount(id, signal) {
    const response = await fetch(`${HN_ITEM_API}/${id}.json`, { signal });
    if (!response.ok) throw new Error(`HN item ${id}: ${response.status}`);
    const item = (await response.json()) as { descendants?: number };
    // A thread with no comments, and a dead one, both come back without
    // `descendants`. Both are legitimately zero.
    return typeof item.descendants === "number" ? item.descendants : 0;
  },
};

const SOURCES: readonly CommentSource[] = [HACKER_NEWS];

/**
 * Counts already resolved, per source, keyed by thread id. Survives remounts,
 * so switching category filters and coming back never refetches a thread. Only
 * successful answers are stored: an unreachable venue stays retryable.
 *
 * Scoped to the source object rather than to a venue name, so a second
 * implementation of the same venue — or a test double — never reads another
 * one's numbers.
 */
const resolved = new WeakMap<CommentSource, Map<string, number>>();

function cacheFor(source: CommentSource): Map<string, number> {
  let cache = resolved.get(source);
  if (!cache) {
    cache = new Map();
    resolved.set(source, cache);
  }
  return cache;
}

/** One venue's contribution, or null when it cannot be read. */
async function venueCount(
  source: CommentSource,
  url: string,
  signal: AbortSignal | undefined
): Promise<number | null> {
  try {
    const id = source.resolveId(url);
    if (!id) return null;

    const cache = cacheFor(source);
    const cached = cache.get(id);
    if (cached !== undefined) return cached;

    const count = await source.fetchCount(id, signal);
    cache.set(id, count);
    return count;
  } catch {
    // Offline, rate limited, dead thread, malformed body: unknown, not zero,
    // and not cached — the next mount tries again.
    return null;
  }
}

export interface CommentCountsOptions {
  /** Venues to sum. Defaults to every venue that can answer. */
  readonly sources?: readonly CommentSource[];
  readonly signal?: AbortSignal;
}

/**
 * Total comments per slug for the posts that have any, keyed by
 * `post.slug`. Posts with no discussion, or whose venues could not be read,
 * are absent from the result so callers can render them unchanged.
 */
export async function fetchCommentCounts(
  posts: readonly Post[],
  { sources = SOURCES, signal }: CommentCountsOptions = {}
): Promise<Record<string, number>> {
  const perPost = await Promise.all(
    posts.map(async (post) => {
      const counts = await Promise.all(
        sources.map((source) => {
          const url = post[source.field];
          return typeof url === "string"
            ? venueCount(source, url, signal)
            : null;
        })
      );
      const total = counts.reduce<number>(
        (sum, count) => sum + (count ?? 0),
        0
      );
      return [post.slug, total] as const;
    })
  );

  const totals: Record<string, number> = {};
  for (const [slug, total] of perPost) {
    if (total > 0) totals[slug] = total;
  }
  return totals;
}
