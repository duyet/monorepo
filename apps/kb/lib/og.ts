/**
 * Single source of truth for the knowledge base's Open Graph cards.
 *
 * Two halves of the pipeline have to agree on the exact path of a card:
 * - `scripts/generate-og.ts` (build time) writes the PNG under `public/og/`
 * - the `/k/$slug`, `/m/$slug`, `/d/$date` and `/c/$category` routes (render
 *   time) emit the `og:image` that points at it
 *
 * When the two disagree you get a 404 inside a social unfurl, which is exactly
 * the failure no test catches. So the mapping lives here and is imported by
 * both sides.
 *
 * Content enumeration is deliberately NOT here: this module is imported by
 * browser route modules, and the content tree is walked with `node:fs` at build
 * time (see `scripts/generate-og.ts`).
 */

export const SITE_URL = "https://kb.duyet.net";

/** Public prefix every generated card is written under. */
export const OG_PREFIX = "/og";

export type OgKind = "index" | "k" | "m" | "d" | "c";

/**
 * Public path of a generated card, e.g. `/og/k/ai-harness-engineering.png`.
 *
 * Slugs are KB filenames (`basename` minus `.md`), so they are already
 * filesystem- and URL-safe; the article/category segment a card is looked up by
 * is percent-encoded here, unlike llm-timeline's slugs which are raw interpolations.
 */
export function ogImagePath(kind: OgKind, slug?: string): string {
  if (kind === "index") return `${OG_PREFIX}/index.png`;
  return `${OG_PREFIX}/${kind}/${encodeURIComponent(slug ?? "")}.png`;
}

/** Absolute `og:image` URL for a generated card. */
export function ogImageUrl(kind: OgKind, slug?: string): string {
  return `${SITE_URL}${ogImagePath(kind, slug)}`;
}

// ── Page copy shared between the route `head()` and the card ─────────────────

export const SITE_TITLE = "Knowledge Base | duyet.net";

export const SITE_DESCRIPTION =
  "Documentation and knowledge base for duyet.net — apps, architecture, and references.";

/** Page title for a KB article, matching what `k/$slug` renders. */
export function articlePageTitle(articleTitle: string): string {
  return `${articleTitle} | Knowledge Base | duyet.net`;
}

/** Page title for a memory note, matching what `m/$slug` renders. */
export function memoryPageTitle(noteTitle: string): string {
  return `${noteTitle} | Memory | Knowledge Base | duyet.net`;
}
