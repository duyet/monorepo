/**
 * OG card URL helpers.
 *
 * These are the single source of truth for "where does the card for this post
 * live", and they are consumed from BOTH sides of the build:
 *
 *   - `scripts/generate-og.ts` writes the PNG to that path
 *   - `$slug/index.tsx` / `$child.tsx` / `note/$id.tsx` / `__root.tsx` emit
 *     `og:image` pointing at that path
 *
 * If the two ever disagree the meta points at a file that was never written and
 * the card silently 404s, so the mapping lives here and nowhere else.
 *
 * Intentionally dependency-free: route modules import this, and we must not
 * drag `og-card.ts` (which dynamically imports `sharp`) into the client bundle
 * by way of a shared constant.
 */

/** Canonical origin for every absolute OG URL. */
export const OG_ORIGIN = "https://blog.duyet.net";

/** `og:site_name` for the blog (the root `duyet.net` default is too broad). */
export const OG_SITE_NAME = "blog.duyet.net";

/** X handle, without the `@`. */
export const OG_TWITTER_CREATOR = "_duyet";

/** Directory (under `public/`) that the generator writes into. */
export const OG_CARD_DIR = "og";

/**
 * Map a post slug to the card's filename stem.
 *
 * `/2026/09/i-dont-read-code-anymore` -> `2026-09-i-dont-read-code-anymore`
 * `/2026/01/coding-agent/opencode`   -> `2026-01-coding-agent-opencode`
 *
 * The year/month prefix is what the URL scheme calls for, but the function
 * keeps every remaining path segment so a child post
 * (`/2026/01/coding-agent/opencode`) cannot collide with a hypothetical
 * top-level `/2026/01/opencode`.
 */
export function ogCardName(slug: string): string {
  return slug
    .replace(/^\/+/, "")
    .replace(/\.(md|mdx|html)$/i, "")
    .replace(/\/+$/, "")
    .split("/")
    .filter(Boolean)
    .join("-")
    .replace(/[^A-Za-z0-9._-]+/g, "-");
}

/** Site-relative path of a post's card, e.g. `/og/2026-09-i-dont-read-code-anymore.png`. */
export function ogCardPath(slug: string): string {
  return `/${OG_CARD_DIR}/${ogCardName(slug)}.png`;
}

/** Site-relative path of a note's card, e.g. `/og/note-ax.png`. */
export function ogNoteCardPath(id: string): string {
  return `/${OG_CARD_DIR}/note-${id.replace(/[^A-Za-z0-9._-]+/g, "-")}.png`;
}

/**
 * The site-wide default card, generated in the "minimal hairline" type-only
 * style (no dither background) and served as the fallback for every page that
 * does not define its own `og:image` — archives, tags, series, 404s, etc.
 */
export const OG_INDEX_CARD = `/${OG_CARD_DIR}/index.png`;

/** Absolute URL for a site-relative OG path. */
export function ogAbsolute(path: string): string {
  return new URL(path, OG_ORIGIN).toString();
}
