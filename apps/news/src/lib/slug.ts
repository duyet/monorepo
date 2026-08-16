import type { FeedItem } from "./types";

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** /ai/some-title-abc12345 style path for a story. */
export function storyPath(
  item: Pick<FeedItem, "id" | "title" | "category">
): string {
  const cat = (item.category ?? "ai").toLowerCase();
  return `/${cat}/${slugify(item.title)}-${item.id.slice(0, 8)}`;
}

/** Extract the item id prefix from a story slug (trailing -<hash>, or a bare hex id). */
export function idPrefixFromSlug(slug: string): string | null {
  const m = slug.match(/-([0-9a-f]{8,64})$/);
  if (m) return m[1];
  return /^[0-9a-f]{8,64}$/.test(slug) ? slug : null;
}
