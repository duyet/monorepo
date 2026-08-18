import type { Lang } from "./types";

/**
 * Title to show for a given UI locale. Vietnamese UI never pretends an
 * English headline is Vietnamese: missing `title_vi` falls back to the
 * original English title and sets `fallbackFromEnglish` so the caller can
 * mark it (`lang="en"`, an EN badge). Never invents a translation.
 */
export function localizedTitle(
  item: { title: string; title_vi: string | null },
  lang: Lang
): { text: string; fallbackFromEnglish: boolean } {
  if (lang !== "vi") {
    return { text: item.title, fallbackFromEnglish: false };
  }
  const vi = item.title_vi?.trim() ?? "";
  if (vi) return { text: vi, fallbackFromEnglish: false };
  return { text: item.title, fallbackFromEnglish: true };
}
