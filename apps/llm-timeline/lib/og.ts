/**
 * Single source of truth for llm-timeline's Open Graph cards.
 *
 * Two halves of the pipeline have to agree on the exact path of a card:
 * - `scripts/generate-og.ts` (build time) writes the PNG under `public/og/`
 * - the `org/$slug`, `year/$year` and `license/$type` routes (render time)
 *   emit the `og:image` that points at it
 *
 * When the two disagree you get a 404 inside a social unfurl, which is exactly
 * the failure no test catches. So the mapping lives here and is imported by
 * both sides, and the per-page copy that goes on a card is defined next to the
 * path it belongs to.
 */

export const SITE_URL = "https://llm-timeline.duyet.net";

/** Public prefix every generated card is written under. */
export const OG_PREFIX = "/og";

export type OgKind = "index" | "org" | "year" | "license";

/**
 * Public path of a generated card, e.g. `/og/org/anthropic.png`.
 *
 * The slug is deliberately NOT percent-encoded. The app's own canonical and
 * `og:url` links already interpolate the raw slug (`/org/${slug}`), and
 * `getSlug` never emits a space, `#`, `?` or `%` — so encoding here would make
 * `og:image` disagree with `og:url` on the same page. The characters that do
 * survive (`,` `&` `(` `)` `'` and non-ASCII) are legal in a path segment per
 * RFC 3986, and React escapes the ampersand on the way into the HTML attribute.
 */
export function ogImagePath(kind: OgKind, slug?: string): string {
  if (kind === "index") return `${OG_PREFIX}/index.png`;
  return `${OG_PREFIX}/${kind}/${slug}.png`;
}

/** Absolute `og:image` URL for a generated card. */
export function ogImageUrl(kind: OgKind, slug?: string): string {
  return `${SITE_URL}${ogImagePath(kind, slug)}`;
}

// ── Page copy shared between the route `head()` and the card ─────────────────

export const SITE_TITLE = "LLM Timeline | llm-timeline.duyet.net";

export const SITE_DESCRIPTION =
  "Interactive timeline of 3,923+ Large Language Model releases from 1950–2026 across 1,378+ organizations.";

export const LICENSES = ["open", "closed", "partial"] as const;
export type LicenseType = (typeof LICENSES)[number];

export const LICENSE_LABELS: Record<LicenseType, string> = {
  open: "Open License",
  closed: "Closed License",
  partial: "Partial License",
};

export const LICENSE_DESCRIPTIONS: Record<LicenseType, string> = {
  open: "Models with openly available weights and code",
  closed: "Proprietary models with API-only access",
  partial: "Models with some restricted access or partial weights",
};

/** `true` when `value` is one of the three license routes. */
export function isLicenseType(value: string): value is LicenseType {
  return (LICENSES as readonly string[]).includes(value);
}
