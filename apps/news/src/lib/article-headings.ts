/** Article page heading contract.

The /{cat}/{slug} document must expose exactly one visible H1 — the story
title. Date / rank / source stay non-heading chrome. Homepage feed rows
keep a non-heading title so the index is not a wall of H1s.
*/

export const ARTICLE_DATE_TAG = "p" as const;
export const ARTICLE_TITLE_TAG = "h1" as const;
export const FEED_TITLE_TAG = "span" as const;

export type StoryTitleTag = typeof ARTICLE_TITLE_TAG | typeof FEED_TITLE_TAG;

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

export function isHeadingTag(tag: string): boolean {
  return HEADING_TAGS.has(tag.toLowerCase());
}

function headingRe(tag: "h1" | "h2"): RegExp {
  return new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
}

export function headingTexts(html: string, tag: "h1" | "h2"): string[] {
  return [...html.matchAll(headingRe(tag))].map((m) =>
    stripTags(m[1]).replace(/\s+/g, " ").trim()
  );
}

export function countHeadings(html: string, tag: "h1" | "h2"): number {
  return (html.match(new RegExp(`<${tag}\\b`, "gi")) ?? []).length;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

/** Minimal article chrome — same tags as StoryContent + titleAs=h1. */
export function articleHeadingMarkup(opts: {
  title: string;
  dateLabel: string;
}): string {
  return [
    `<${ARTICLE_DATE_TAG} class="text-xl font-bold">${opts.dateLabel}</${ARTICLE_DATE_TAG}>`,
    `<span class="w-5">1</span>`,
    `<${ARTICLE_TITLE_TAG} class="inline">${opts.title}</${ARTICLE_TITLE_TAG}>`,
    `<span>2/97</span>`,
  ].join("");
}
