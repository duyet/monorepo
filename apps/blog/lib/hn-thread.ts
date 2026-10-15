/**
 * A Hacker News discussion as a nested tree.
 *
 * Algolia's items API returns the whole thread, replies nested to any depth,
 * in one request and sends `access-control-allow-origin: *`. The Firebase API
 * would need one request per comment. Callers fetch only after the reader
 * expands the section, so the prerendered page never depends on it.
 */

const HN_ITEMS_API = "https://hn.algolia.com/api/v1/items";

export interface HnComment {
  readonly id: number;
  readonly author: string;
  /** Unix seconds. */
  readonly createdAt: number;
  /** HN-flavoured HTML (`<p>`, `<a>`, `<i>`, `<pre><code>`). Never inject raw. */
  readonly html: string;
  readonly children: readonly HnComment[];
}

export interface HnThread {
  readonly id: number;
  readonly total: number;
  readonly comments: readonly HnComment[];
}

interface AlgoliaItem {
  id: number;
  author?: string | null;
  text?: string | null;
  created_at_i?: number;
  children?: AlgoliaItem[];
}

/** "https://news.ycombinator.com/item?id=49869107" -> "49869107" */
export function hnItemId(url: string): string | null {
  return url.match(/[?&]id=(\d+)/)?.[1] ?? null;
}

function toComments(items: readonly AlgoliaItem[] | undefined): HnComment[] {
  const out: HnComment[] = [];
  for (const item of items ?? []) {
    // Deleted and dead comments come back with no author and no text. HN
    // greys them out as [flagged]; there is nothing to read, so skip the node
    // but keep any live replies under it.
    if (!item.author || !item.text) {
      out.push(...toComments(item.children));
      continue;
    }
    out.push({
      id: item.id,
      author: item.author,
      createdAt: item.created_at_i ?? 0,
      html: item.text,
      children: toComments(item.children),
    });
  }
  return out;
}

function countAll(comments: readonly HnComment[]): number {
  return comments.reduce((n, c) => n + 1 + countAll(c.children), 0);
}

export function parseHnThread(item: AlgoliaItem): HnThread {
  const comments = toComments(item.children);
  return { id: item.id, total: countAll(comments), comments };
}

export async function fetchHnThread(
  id: string,
  signal?: AbortSignal
): Promise<HnThread> {
  const response = await fetch(`${HN_ITEMS_API}/${id}`, { signal });
  if (!response.ok) throw new Error(`HN item ${id}: ${response.status}`);
  return parseHnThread((await response.json()) as AlgoliaItem);
}
