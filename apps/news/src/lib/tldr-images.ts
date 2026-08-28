import type { TldrBullet } from "./types";

/** Build id → story image for attaching to AI;DR bullets at read time. */
export function imageUrlByItemId(
  items: Array<{ id: string; image_url?: string | null }>
): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of items) {
    if (item.id && item.image_url) map.set(item.id, item.image_url);
  }
  return map;
}

/** Every story id cited by either language's bullets. */
export function collectTldrItemIds(
  tldr: { bullets_en: TldrBullet[]; bullets_vi: TldrBullet[] } | null
): string[] {
  if (!tldr) return [];
  const ids = new Set<string>();
  for (const bullet of [...tldr.bullets_en, ...tldr.bullets_vi]) {
    for (const id of bullet.item_ids ?? []) {
      if (id) ids.add(id);
    }
  }
  return [...ids];
}

/** Additive `image_url` from the first linked story that has one.
 * Omits the field when none of the cited stories have an image so the
 * stored snapshot shape (`text` + `item_ids`) stays unchanged. */
export function attachTldrBulletImages(
  bullets: TldrBullet[],
  imageByItemId: Map<string, string>
): TldrBullet[] {
  return bullets.map((bullet) => {
    if (bullet.image_url) return bullet;
    for (const id of bullet.item_ids ?? []) {
      const url = imageByItemId.get(id);
      if (url) return { ...bullet, image_url: url };
    }
    return bullet;
  });
}

export function withTldrImages<
  T extends { bullets_en: TldrBullet[]; bullets_vi: TldrBullet[] },
>(
  tldr: T | null,
  imageByItemId: Map<string, string>
):
  | (Omit<T, "bullets_en" | "bullets_vi"> & {
      bullets_en: TldrBullet[];
      bullets_vi: TldrBullet[];
    })
  | null {
  if (!tldr) return tldr;
  return {
    ...tldr,
    bullets_en: attachTldrBulletImages(tldr.bullets_en, imageByItemId),
    bullets_vi: attachTldrBulletImages(tldr.bullets_vi, imageByItemId),
  };
}
