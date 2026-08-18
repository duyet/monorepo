import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "./site";
import { storyPath } from "./slug";

export type HeadMeta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

export interface HeadLink {
  rel: string;
  href: string;
  type?: string;
}

export interface HeadTags {
  meta: HeadMeta[];
  links: HeadLink[];
}

const SITEMAP_LINK: HeadLink = {
  rel: "sitemap",
  type: "application/xml",
  href: `${SITE_URL}/sitemap.xml`,
};

function shareTags(opts: {
  title: string;
  description: string;
  url: string;
  type: "website" | "article";
  imageUrl?: string | null;
}): HeadMeta[] {
  const twitterCard = opts.imageUrl ? "summary_large_image" : "summary";
  const meta: HeadMeta[] = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { property: "og:type", content: opts.type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:url", content: opts.url },
    { name: "twitter:card", content: twitterCard },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
  ];
  if (opts.imageUrl) {
    meta.push({ property: "og:image", content: opts.imageUrl });
    meta.push({ name: "twitter:image", content: opts.imageUrl });
  }
  return meta;
}

/** Homepage Open Graph / Twitter / canonical tags. */
export function homepageHead(): HeadTags {
  const url = `${SITE_URL}/`;
  return {
    meta: shareTags({
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url,
      type: "website",
    }),
    links: [{ rel: "canonical", href: url }, SITEMAP_LINK],
  };
}

/**
 * Article share tags. `name=description` and OG/Twitter descriptions use
 * the item's own English summary/dek when present; otherwise the
 * site-wide blurb. Never invents a Vietnamese description.
 */
export function articleHead(item: {
  id: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  category: string | null;
}): HeadTags {
  const path = storyPath(item);
  const url = `${SITE_URL}${path}`;
  const title = `${item.title} | ${SITE_NAME}`;
  const summary = item.summary?.trim() ?? "";
  const description = summary || SITE_DESCRIPTION;
  return {
    meta: shareTags({
      title,
      description,
      url,
      type: "article",
      imageUrl: item.image_url,
    }).map((tag) =>
      "property" in tag && tag.property === "og:title"
        ? { property: "og:title", content: item.title }
        : "name" in tag && tag.name === "twitter:title"
          ? { name: "twitter:title", content: item.title }
          : tag
    ),
    links: [{ rel: "canonical", href: url }, SITEMAP_LINK],
  };
}

export function notFoundHead(documentTitle: string): HeadTags {
  return {
    meta: [
      { title: documentTitle },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [SITEMAP_LINK],
  };
}
