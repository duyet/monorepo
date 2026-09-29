/**
 * The single seam for Open Graph / Twitter card metadata in `apps/home`.
 *
 * Every route's `head()` funnels through `pageHead()`, so the tag set is
 * uniform across `/`, `/about`, `/p/$project`, and the rest — and the
 * build-time card generator (`scripts/generate-og.ts`) and the prerender list
 * (`vite.config.ts`) can both derive paths from the constants here.
 *
 * Two rules this module exists to enforce:
 *
 * 1. `og:image` must be an **absolute** URL. Crawlers resolve `og:image`
 *    against the *fetching* URL, not the page, so a relative path in a
 *    prerendered document is unreliable at best.
 * 2. `rel="canonical"` belongs in `links[]`, never `meta[]`. TanStack Start
 *    silently drops a `rel` attribute that arrives inside `meta`.
 */

import { type OgMetaTag, ogHeadLinks, ogMeta } from "@duyet/config/og";

/** Canonical origin. Every OG url/image is made absolute against this. */
export const SITE_URL = "https://duyet.net";

/** Public directory the build-time card generator writes into. */
export const OG_DIR = "/og";

/** Home page card: dithered from a duyetbot screenshot. */
export const HOME_CARD = `${OG_DIR}/home.png`;

/**
 * Type-only card shared by the long tail of static pages (about, contact,
 * privacy, brand, projects, career chapters, …). One image, ten pages — these
 * pages have no distinct artwork worth dithering, and a wall of ten
 * near-identical cards helps nobody.
 */
export const DEFAULT_CARD = `${OG_DIR}/default.png`;

/** Card path for a `/p/$project` page. */
export function projectCard(slug: string): string {
  return `${OG_DIR}/p/${slug}.png`;
}

/** Make a public-path card absolute. `absoluteOgUrl` is a no-op on absolute input. */
export function ogUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export type PageOgInput = {
  /** Site-relative path, e.g. `/about` or `/p/stamp`. */
  path: string;
  title: string;
  description: string;
  /** Site-relative card path. Defaults to `DEFAULT_CARD`. */
  image?: string;
  /** Accessible description of the card image. Defaults to `title`. */
  imageAlt?: string;
  type?: "website" | "article";
};

export type PageHead = {
  meta: Array<OgMetaTag | { title: string } | { name: string; content: string }>;
  links: Array<{ rel: string; href: string; type?: string }>;
};

/**
 * Build the `head()` return value for a page: `<title>`, `<meta name=description>`,
 * the full OG + Twitter set, and the canonical link.
 *
 * Route-level `head()` results spread the result so a route can keep its own
 * extra meta (`theme-color`, JSON-LD scripts, …) alongside it.
 */
export function pageHead(input: PageOgInput): PageHead {
  const { path, title, description, image = DEFAULT_CARD, imageAlt, type } = input;
  const url = new URL(path, SITE_URL).toString();

  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...ogMeta({
        url,
        title,
        description,
        image: ogUrl(image),
        imageAlt,
        type,
      }),
    ],
    links: ogHeadLinks({ url }),
  };
}

/** Just the OG + Twitter `meta[]` entries — for the root, which owns extra tags. */
export function pageOgMeta(input: PageOgInput): OgMetaTag[] {
  const { title, description, image = HOME_CARD, imageAlt, type } = input;
  return ogMeta({
    url: new URL(input.path, SITE_URL).toString(),
    title,
    description,
    image: ogUrl(image),
    imageAlt,
    type,
  });
}
