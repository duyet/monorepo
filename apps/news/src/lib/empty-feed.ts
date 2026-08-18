import type { Lang } from "./types";

/**
 * Empty-state copy for the landing feed. Search (with or without hits)
 * must not reuse the "no news on the site" / category-browse message.
 */
export function emptyFeedCopy(opts: {
  lang: Lang;
  q?: string;
  selectedCategoryCount: number;
}): string {
  if (opts.q) {
    return opts.lang === "vi"
      ? `Không tìm thấy tin cho “${opts.q}”.`
      : `No stories match “${opts.q}”.`;
  }
  if (opts.selectedCategoryCount > 0) {
    return opts.lang === "vi"
      ? "Không có tin phù hợp với bộ lọc."
      : "No stories match the selected filters.";
  }
  return opts.lang === "vi" ? "Chưa có tin nào." : "No stories yet.";
}

/** Browse chrome (global category chips, trending) is for the live feed,
 * not for a search results view. */
export function showFeedBrowseChrome(q?: string): boolean {
  return !q;
}
