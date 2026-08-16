import type { FeedItem } from "./types";

/** /ai/abc12345 style path for a story — category + 8-char id prefix. */
export function storyPath(
  item: Pick<FeedItem, "id" | "category">
): string {
  const cat = (item.category ?? "ai").toLowerCase();
  return `/${cat}/${item.id.slice(0, 8)}`;
}

/**
 * Extract the item id prefix from a story path segment: a bare hex id, or a
 * legacy `some-title-<hash>` slug (old URLs stay routable).
 */
export function idPrefixFromSlug(slug: string): string | null {
  if (/^[0-9a-f]{8,64}$/.test(slug)) return slug;
  const m = slug.match(/-([0-9a-f]{8,64})$/);
  return m ? m[1] : null;
}
