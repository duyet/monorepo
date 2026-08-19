import type { Lang } from "./types";

/** Vietnamese diacritics (plus đ). English titles never contain these. */
const VI_DIACRITIC_RE =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export function looksVietnamese(text: string): boolean {
  return VI_DIACRITIC_RE.test(text);
}

/**
 * Title to show for a given UI locale. Vietnamese UI never pretends an
 * English headline is Vietnamese: missing `title_vi` falls back to the
 * original English title and sets `fallbackFromEnglish` so the caller can
 * mark it (`lang="en"`, an EN badge). Never invents a translation.
 *
 * If the painted title is already Vietnamese (diacritics in `title` or a
 * stored `title_vi`), the EN badge stays hidden.
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
  if (looksVietnamese(item.title)) {
    return { text: item.title, fallbackFromEnglish: false };
  }
  return { text: item.title, fallbackFromEnglish: true };
}
