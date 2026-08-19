import {
  isEnglishOnlyViTldr,
  itemsHaveTitleVi,
} from "../../worker/tldr-lang.js";
import type { FeedItem, FeedResponse, TldrBullet } from "./types";

const TLDR_DISPLAY_MIN = 2;
const TLDR_FALLBACK_CAP = 16;

/** Homepage / API: a snapshot is too thin to display when either language
 * has fewer than 2 bullets (a leftover line is a bug). */
export function isThinDisplayTldr(
  tldr: { bullets_en: TldrBullet[]; bullets_vi: TldrBullet[] } | null
): boolean {
  if (!tldr) return true;
  return (
    Math.max(tldr.bullets_en.length, tldr.bullets_vi.length) < TLDR_DISPLAY_MIN
  );
}

/** Last-24h items by rank_score (then published_at), capped at 16. If the
 * rolling window has fewer than 2 stories, fall back to the full list. */
export function pickLast24hRanked<
  T extends { rank_score?: number; published_at: number },
>(
  items: T[],
  nowSec: number = Math.floor(Date.now() / 1000),
  cap = TLDR_FALLBACK_CAP
): T[] {
  const since = nowSec - 86400;
  const window = items.filter((item) => item.published_at >= since);
  const source = window.length >= TLDR_DISPLAY_MIN ? window : items;
  return [...source]
    .sort((a, b) => {
      const ar =
        typeof a.rank_score === "number"
          ? a.rank_score
          : Number.NEGATIVE_INFINITY;
      const br =
        typeof b.rank_score === "number"
          ? b.rank_score
          : Number.NEGATIVE_INFINITY;
      if (ar !== br) return br - ar;
      return b.published_at - a.published_at;
    })
    .slice(0, cap);
}

/** Title-fallback digest: EN = title; VI = title_vi || title. Never invents
 * prose. One VI bullet per ranked item so the homepage is never left with
 * a single leftover translation. */
export function synthesizeTldrFromItems(
  items: Array<{ id: string; title: string; title_vi?: string | null }>
): { bullets_en: TldrBullet[]; bullets_vi: TldrBullet[] } {
  const bullets_en: TldrBullet[] = [];
  const bullets_vi: TldrBullet[] = [];
  for (const item of items) {
    const title = item.title.trim();
    if (!title) continue;
    bullets_en.push({ text: title, item_ids: [item.id] });
    bullets_vi.push({
      text: item.title_vi?.trim() || title,
      item_ids: [item.id],
    });
  }
  return { bullets_en, bullets_vi };
}

/** True when the homepage should replace a stored snapshot: thin leftover,
 * or English-only bullets_vi while title_vi now exists. */
export function shouldRebuildTldrForDisplay(
  tldr: FeedResponse["tldr"],
  items: Array<{ title_vi?: string | null }>
): boolean {
  if (isThinDisplayTldr(tldr)) return items.length >= 2;
  if (!tldr) return false;
  return isEnglishOnlyViTldr(tldr.bullets_vi) && itemsHaveTitleVi(items);
}

/** If the stored snapshot is thin — or bullets_vi is English-only while
 * title_vi exists — replace with a last-24h ranked title-fallback. A
 * useful EN digest keeps its bullets_en; only VI is rebuilt from
 * title_vi. Keeps the snapshot date so the subtitle stays the ICT day. */
export function resolveTldrForDisplay(
  tldr: FeedResponse["tldr"],
  items: FeedItem[],
  nowSec: number = Math.floor(Date.now() / 1000)
): FeedResponse["tldr"] {
  const rebuildViOnly =
    !isThinDisplayTldr(tldr) &&
    tldr != null &&
    isEnglishOnlyViTldr(tldr.bullets_vi) &&
    itemsHaveTitleVi(items);
  if (!isThinDisplayTldr(tldr) && !rebuildViOnly) return tldr;
  if (items.length < 2) return tldr;
  const ranked = pickLast24hRanked(items, nowSec);
  if (ranked.length < 2) return tldr;
  const fallback = synthesizeTldrFromItems(ranked);
  if (fallback.bullets_en.length < 2) return tldr;
  return {
    date: tldr?.date ?? "",
    bullets_en: rebuildViOnly && tldr ? tldr.bullets_en : fallback.bullets_en,
    bullets_vi: fallback.bullets_vi,
  };
}

/** VI chrome never paints English. English-only or leftover-thin
 * bullets_vi hides the section; getFeed already rebuilds from title_vi. */
export function displayTldrBullets(
  tldr: FeedResponse["tldr"],
  lang: "en" | "vi"
): TldrBullet[] {
  if (!tldr) return [];
  if (lang !== "vi") return tldr.bullets_en;
  if (isEnglishOnlyViTldr(tldr.bullets_vi)) return [];
  if (tldr.bullets_vi.length >= TLDR_DISPLAY_MIN) return tldr.bullets_vi;
  return [];
}
