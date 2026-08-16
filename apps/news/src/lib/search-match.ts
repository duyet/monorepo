import type { FeedItem, Lang } from "./types";

export interface StorySuggestion {
  item: FeedItem;
  title: string;
  matchStart: number;
  matchEnd: number;
}

/**
 * Case-insensitive substring match against each item's lang-appropriate
 * title (falls back to the English title when no Vietnamese one exists).
 * Pure and side-effect-free: caller supplies the already-loaded feed items.
 * Returns at most `limit` matches, in feed order (already ranked/sorted).
 */
export function matchStories(
  items: FeedItem[],
  query: string,
  lang: Lang,
  limit = 7
): StorySuggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: StorySuggestion[] = [];
  for (const item of items) {
    const title = lang === "vi" && item.title_vi ? item.title_vi : item.title;
    const idx = title.toLowerCase().indexOf(q);
    if (idx === -1) continue;
    out.push({ item, title, matchStart: idx, matchEnd: idx + q.length });
    if (out.length >= limit) break;
  }
  return out;
}

export interface FilterSuggestion {
  kind: "topic" | "category";
  value: string;
  count: number;
}

/**
 * Exact (case-insensitive) match of the query against a trending tag name
 * or a feed category name — the "apply this filter" suggestion row.
 * Tags are checked first since they're more specific than categories.
 */
export function matchFilterTarget(
  query: string,
  categories: { name: string; count: number }[],
  trending: { tag: string; count: number }[]
): FilterSuggestion | null {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return null;
  const tag = trending.find((t) => t.tag.toLowerCase() === q);
  if (tag) return { kind: "topic", value: tag.tag, count: tag.count };
  const cat = categories.find((c) => c.name.toLowerCase() === q);
  if (cat) return { kind: "category", value: cat.name, count: cat.count };
  return null;
}
