/**
 * Open Graph / Twitter card helpers.
 *
 * Translates an `AppMetadata` (or an explicit options object) into the flat
 * `meta[]` array shape that TanStack Start's `head()` expects, so every app
 * emits the same, complete set of OG + Twitter tags from one place.
 *
 * Why this exists: `AppMetadata.openGraph` / `.twitter` were fully defined and
 * populated in `app.config.ts` but read by zero lines of code. These helpers
 * make that config live, and give the rest of the monorepo a single seam for
 * OG tags instead of each `__root.tsx` hand-rolling its own set.
 *
 * The canonical fully-populated reference implementation is
 * `apps/x-algo/src/routes/__root.tsx` — this module emits that same shape.
 */

import type { AppMetadata } from "./app.config";

/** A single entry in a TanStack Start `head().meta` array. */
export type OgMetaTag = {
  property?: string;
  name?: string;
  content: string;
  [key: string]: unknown;
};

type OgImageEntry = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export type OgImage = OgImageEntry;

export type OgOptions = {
  /** Absolute canonical URL of the page. */
  url: string;
  title: string;
  description: string;
  /**
   * Absolute URL to a 1200×630 card. When omitted, any `fallbackImage` is used
   * instead, and if neither is present no `og:image` is emitted at all.
   */
  image?: string;
  /** Width of `image`, default 1200. */
  imageWidth?: number;
  /** Height of `image`, default 630. */
  imageHeight?: number;
  /** Alt text for `image` — required for accessibility on unfurls. */
  imageAlt?: string;
  /** `"website"` for hubs, `"article"` for content pages. */
  type?: string;
  siteName?: string;
  locale?: string;
  /** `"summary_large_image"` when an image is present, else `"summary"`. */
  twitterCard?: string;
  /** X/Twitter handle without the `@`, e.g. `_duyet`. */
  creator?: string;
  /** Emit `og:image:width` / `og:image:height`. Default true. */
  imageDimensions?: boolean;
};

const DEFAULT_CREATOR = "_duyet";
const SITE_NAME = "duyet.net";
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/**
 * Build the full OG + Twitter `meta[]` array.
 *
 * Image-related tags are omitted entirely when there is no image, rather than
 * emitted empty — an empty `og:image` is worse than none, because crawlers may
 * try to resolve it and cache a broken card.
 */
export function ogMeta(options: OgOptions): OgMetaTag[] {
  const {
    url,
    title,
    description,
    image,
    imageWidth = OG_WIDTH,
    imageHeight = OG_HEIGHT,
    imageAlt,
    type = "website",
    siteName = SITE_NAME,
    locale,
    creator = DEFAULT_CREATOR,
    imageDimensions = true,
  } = options;

  const meta: OgMetaTag[] = [
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:site_name", content: siteName },
  ];

  if (locale) meta.push({ property: "og:locale", content: locale });

  if (image) {
    meta.push(
      { property: "og:image", content: image },
      { property: "og:image:alt", content: imageAlt || title },
    );
    if (imageDimensions) {
      meta.push(
        { property: "og:image:width", content: String(imageWidth) },
        { property: "og:image:height", content: String(imageHeight) },
      );
    }
  }

  meta.push(
    {
      name: "twitter:card",
      content: image ? (options.twitterCard ?? "summary_large_image") : "summary",
    },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  );

  if (image) meta.push({ name: "twitter:image", content: image });
  if (creator) meta.push({ name: "twitter:creator", content: `@${creator}` });

  return meta;
}

/**
 * Build OG tags from an app's `AppMetadata` config, letting per-page values
 * override the config defaults.
 *
 * This is the seam that revives `AppMetadata.openGraph` / `.twitter`: an app
 * that already declares its OG config only needs to call this once.
 */
export function ogMetaFromConfig(
  metadata: AppMetadata,
  overrides: Partial<OgOptions> = {},
): OgMetaTag[] {
  const og = metadata.openGraph;
  const twitter = metadata.twitter;
  const first = og?.images?.[0];

  return ogMeta({
    url: overrides.url ?? og?.url ?? "",
    title: overrides.title ?? og?.title ?? metadata.title,
    description:
      overrides.description ?? og?.description ?? metadata.description,
    image: overrides.image ?? first?.url,
    imageWidth: overrides.imageWidth ?? first?.width ?? OG_WIDTH,
    imageHeight: overrides.imageHeight ?? first?.height ?? OG_HEIGHT,
    imageAlt: overrides.imageAlt ?? first?.alt,
    type: overrides.type ?? og?.type ?? "website",
    siteName: overrides.siteName ?? og?.siteName ?? SITE_NAME,
    locale: overrides.locale ?? og?.locale,
    twitterCard: overrides.twitterCard ?? twitter?.card,
    creator: overrides.creator ?? twitter?.creator?.replace(/^@/, ""),
  });
}

/**
 * The `links[]` entries that accompany a card: canonical URL, favicons, manifest.
 * Kept separate from `ogMeta` because TanStack Start puts these in `links`, not
 * `meta` — a `rel=canonical` inside `meta[]` is silently dropped.
 */
export function ogHeadLinks(options: {
  url: string;
  icon?: string;
  apple?: string;
  manifest?: string;
}): Array<{ rel: string; href: string; type?: string }> {
  const { url, icon, apple, manifest } = options;
  const links: Array<{ rel: string; href: string; type?: string }> = [];

  if (url) links.push({ rel: "canonical", href: url });
  if (icon) {
    links.push({ rel: "icon", href: icon, type: "image/svg+xml" });
  }
  if (apple) links.push({ rel: "apple-touch-icon", href: apple });
  if (manifest) links.push({ rel: "manifest", href: manifest });

  return links;
}

/** Make a possibly-relative OG image path absolute against a site origin. */
export function absoluteOgUrl(path: string | undefined, origin: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, origin).toString();
}
