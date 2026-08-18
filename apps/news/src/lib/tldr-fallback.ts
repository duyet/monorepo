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

/** If the stored snapshot is thin while the feed has 2+ stories, replace
 * bullets with a last-24h ranked title-fallback. Keeps the snapshot date
 * when present so the subtitle stays the ICT calendar day. */
export function resolveTldrForDisplay(
  tldr: FeedResponse["tldr"],
  items: FeedItem[],
  nowSec: number = Math.floor(Date.now() / 1000)
): FeedResponse["tldr"] {
  if (!isThinDisplayTldr(tldr) || items.length < 2) return tldr;
  const ranked = pickLast24hRanked(items, nowSec);
  if (ranked.length < 2) return tldr;
  const fallback = synthesizeTldrFromItems(ranked);
  if (fallback.bullets_en.length < 2) return tldr;
  return {
    date: tldr?.date ?? "",
    bullets_en: fallback.bullets_en,
    bullets_vi: fallback.bullets_vi,
  };
}

/** VI never shows a leftover 1-bullet list while EN has many: fall back to
 * bullets_en (or the synthesized list already stored on the snapshot). */
export function displayTldrBullets(
  tldr: FeedResponse["tldr"],
  lang: "en" | "vi"
): TldrBullet[] {
  if (!tldr) return [];
  if (lang !== "vi") return tldr.bullets_en;
  if (tldr.bullets_vi.length >= TLDR_DISPLAY_MIN) return tldr.bullets_vi;
  return tldr.bullets_en.length > tldr.bullets_vi.length
    ? tldr.bullets_en
    : tldr.bullets_vi;
}
