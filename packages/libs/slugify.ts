/**
 * Parameterized slugify implementation shared across the monorepo.
 * Modes preserve legacy per-consumer URL-visible behavior.
 */

const EMOJI_REGEX =
  /([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

export type SlugifyMode = "punct" | "collapse";

export interface SlugifyOptions {
  mode?: SlugifyMode;
  maxLength?: number;
  stripWiki?: boolean;
}

function truncateAtWordBoundary(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) {
    return slug;
  }

  const truncated = slug.slice(0, maxLength);
  const lastHyphen = truncated.lastIndexOf("-");
  return lastHyphen > 0 ? truncated.slice(0, lastHyphen) : truncated;
}

function slugifyPunct(input: string, maxLength: number): string {
  let slug = input
    .toLowerCase()
    .replace(EMOJI_REGEX, "")
    .replace(/ /g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(/-[^-]*$/, "");
  }

  return slug;
}

function slugifyCollapse(input: string, maxLength?: number): string {
  let slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (maxLength !== undefined && slug.length > maxLength) {
    slug = truncateAtWordBoundary(slug, maxLength);
  }

  return slug;
}

export function slugify(input?: string, options: SlugifyOptions = {}): string {
  if (!input) {
    return "";
  }

  const { mode = "collapse", maxLength, stripWiki = false } = options;
  let normalized = input;

  if (stripWiki) {
    normalized = String(normalized)
      .replace(/\[\[|\]\]/g, "")
      .trim();
  }

  if (mode === "punct") {
    return slugifyPunct(normalized, maxLength ?? 100);
  }

  return slugifyCollapse(normalized, maxLength);
}

export function kbSlugify(input: string): string {
  return slugify(input, { mode: "collapse", stripWiki: true });
}
