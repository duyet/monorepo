/**
 * Blog article `head()` builder.
 *
 * Every blog surface — post pages, child chapters, and quick notes — needs the
 * same six things: a `<title>`, a description, an OG/Twitter card, a canonical
 * URL, a `rel=alternate` markdown link, and a `BlogPosting` JSON-LD blob. That
 * shape was hand-rolled three times over, and the copies had already drifted
 * (the note route used a different title suffix, only the post routes attached
 * the X widget script, and only two of the three offered the raw markdown
 * alternate).
 *
 * Pulling it into one builder means:
 *   - a card cannot go missing on one route while its siblings keep theirs
 *   - the JSON-LD is identical everywhere, so rich-result eligibility does not
 *     depend on which route a crawler happened to land on
 *   - the whole thing is unit-testable, instead of a `readFileSync` string
 *     match against the route source (which broke the moment the canonical
 *     link moved into `ogHeadLinks`)
 *
 * Import cost matters here: route modules import this, so it must stay
 * dependency-free. `@duyet/config/og` is already in the client bundle.
 */

import { ogHeadLinks, ogMeta } from "@duyet/config/og";
import { OG_SITE_NAME, OG_TWITTER_CREATOR } from "./og";

/** Author block shared by every JSON-LD blob on the site. */
const AUTHOR = {
  "@type": "Person",
  name: "Duyet Le",
  url: "https://duyet.net",
};

export type ArticleHeadInput = {
  /** Page title, without any site-name suffix. */
  title: string;
  /** Meta description / OG description. */
  description: string;
  /** Absolute canonical URL. */
  url: string;
  /** Absolute 1200×630 card URL. */
  image: string;
  /** Appended to `title` in `<title>`, e.g. `" | Tôi là Duyệt"`. */
  titleSuffix?: string;
  /**
   * Href for the `rel=alternate type="text/markdown"` link. Posts and notes
   * both publish a sibling `.md` file. Omit only when a surface has none.
   */
  markdownHref?: string;
  /**
   * `datePublished` for JSON-LD; omitted from the blob when falsy.
   *
   * Accepts a `Date` because that is what `Post["date"]` carries, and
   * normalizes it to an ISO string here — JSON-LD requires `Date` in
   * ISO-8601, and `JSON.stringify` would emit an ISO string but silently
   * *drop the key* for an Invalid Date, so normalizing keeps the two failure
   * modes distinct.
   */
  datePublished?: Date | string;
  /** Extra `<script>` entries, appended after the JSON-LD blob. */
  scripts?: Array<{ src?: string; children?: string; async?: boolean }>;
};

export type ArticleHead = {
  meta: Array<Record<string, unknown>>;
  links: Array<{ rel: string; href: string; type?: string }>;
  scripts: Array<Record<string, unknown>>;
};

/**
 * Build the canonical article `head()` return value.
 *
 * `og:image` is always present here, so the card is always
 * `summary_large_image`; the site-wide default card lives one layer up in the
 * app root.
 */
export function buildArticleHead(input: ArticleHeadInput): ArticleHead {
  const {
    title,
    description,
    url,
    image,
    titleSuffix = " | Tôi là Duyệt",
    markdownHref,
    datePublished,
    scripts = [],
  } = input;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    url,
    author: AUTHOR,
    image,
  };
  // Omitted rather than emitted as `null`: a JSON-LD key with a null value is
  // an invalid date for Google's rich-result validator.
  if (datePublished) {
    jsonLd.datePublished =
      datePublished instanceof Date
        ? datePublished.toISOString()
        : datePublished;
  }

  return {
    meta: [
      { title: `${title}${titleSuffix}` },
      { name: "description", content: description },
      ...ogMeta({
        url,
        title,
        description,
        image,
        type: "article",
        siteName: OG_SITE_NAME,
        creator: OG_TWITTER_CREATOR,
      }),
    ],
    links: [
      // canonical belongs in `links`, not `meta` — a rel=canonical inside
      // meta[] is silently dropped.
      ...ogHeadLinks({ url }),
      ...(markdownHref
        ? [{ rel: "alternate", type: "text/markdown", href: markdownHref }]
        : []),
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(jsonLd) },
      ...scripts,
    ],
  };
}
