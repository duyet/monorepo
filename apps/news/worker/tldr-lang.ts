/** Vietnamese diacritics (plus đ). English titles never contain these. */
const VI_DIACRITIC_RE =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export function looksVietnamese(text: string): boolean {
  return VI_DIACRITIC_RE.test(text);
}

function bulletTexts(bullets: unknown[]): string[] {
  const out: string[] = [];
  for (const bullet of bullets) {
    if (typeof bullet === "string" && bullet.trim()) {
      out.push(bullet);
      continue;
    }
    if (bullet && typeof bullet === "object" && "text" in bullet) {
      const text = (bullet as { text?: unknown }).text;
      if (typeof text === "string" && text.trim()) out.push(text);
    }
  }
  return out;
}

/** True when the VI column is empty or has no Vietnamese diacritics
 * (LLM copied EN, or title-fallback ran before title_vi existed). */
export function isEnglishOnlyViTldr(bullets_vi: unknown[]): boolean {
  const texts = bulletTexts(bullets_vi);
  if (texts.length === 0) return true;
  return !texts.some(looksVietnamese);
}

export function itemsHaveTitleVi(
  items: Array<{ title_vi?: string | null }>
): boolean {
  return items.some((item) => Boolean(item.title_vi?.trim()));
}

/** Rebuild VI from title_vi when the snapshot is English-only and
 * translations now exist. Does not invent prose. */
export function needsViTitleFallback(
  bullets_vi: unknown[],
  items: Array<{ title_vi?: string | null }>
): boolean {
  return isEnglishOnlyViTldr(bullets_vi) && itemsHaveTitleVi(items);
}
