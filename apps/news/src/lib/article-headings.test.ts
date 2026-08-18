import { describe, expect, it } from "vitest";
import {
  ARTICLE_DATE_TAG,
  ARTICLE_TITLE_TAG,
  articleHeadingMarkup,
  countHeadings,
  FEED_TITLE_TAG,
  headingTexts,
  isHeadingTag,
} from "./article-headings";
import { formatDayHeading } from "./lang";

describe("article heading tags", () => {
  it("makes the story title the only heading tag", () => {
    expect(ARTICLE_TITLE_TAG).toBe("h1");
    expect(isHeadingTag(ARTICLE_TITLE_TAG)).toBe(true);
    expect(isHeadingTag(ARTICLE_DATE_TAG)).toBe(false);
    expect(isHeadingTag(FEED_TITLE_TAG)).toBe(false);
  });
});

describe("article page headings", () => {
  const title = "Nvidia builds a new campus in Ohio";
  const dateLabel = formatDayHeading("2026-08-17", "vi");
  const html = articleHeadingMarkup({ title, dateLabel });

  it("exposes exactly one H1 with the story title", () => {
    expect(countHeadings(html, "h1")).toBe(1);
    expect(headingTexts(html, "h1")).toEqual([title]);
  });

  it("does not put the date in an H1 or H2", () => {
    expect(countHeadings(html, "h2")).toBe(0);
    expect(headingTexts(html, "h1").join("")).not.toContain(dateLabel);
    expect(html).toContain(`<${ARTICLE_DATE_TAG}`);
    expect(html).toContain(dateLabel);
  });
});

describe("feed title tag", () => {
  it("keeps homepage StoryRow titles off the heading outline", () => {
    expect(FEED_TITLE_TAG).toBe("span");
    expect(isHeadingTag(FEED_TITLE_TAG)).toBe(false);
  });
});
