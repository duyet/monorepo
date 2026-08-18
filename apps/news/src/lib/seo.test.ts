import { describe, expect, it } from "vitest";
import { articleHead, homepageHead, notFoundHead } from "./seo";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "./site";

function metaContent(
  tags: {
    name?: string;
    property?: string;
    content?: string;
    title?: string;
  }[],
  key: string
): string | undefined {
  const hit = tags.find(
    (t) => t.name === key || t.property === key || (key === "title" && t.title)
  );
  return hit?.content ?? hit?.title;
}

describe("homepageHead", () => {
  it("emits og, twitter, and canonical tags for the site", () => {
    const head = homepageHead();
    expect(metaContent(head.meta, "title")).toBe(SITE_TITLE);
    expect(metaContent(head.meta, "description")).toBe(SITE_DESCRIPTION);
    expect(metaContent(head.meta, "og:title")).toBe(SITE_TITLE);
    expect(metaContent(head.meta, "og:description")).toBe(SITE_DESCRIPTION);
    expect(metaContent(head.meta, "og:url")).toBe(`${SITE_URL}/`);
    expect(metaContent(head.meta, "og:type")).toBe("website");
    expect(metaContent(head.meta, "twitter:card")).toBe("summary");
    expect(metaContent(head.meta, "twitter:title")).toBe(SITE_TITLE);
    expect(metaContent(head.meta, "twitter:description")).toBe(
      SITE_DESCRIPTION
    );
    expect(head.links).toContainEqual({
      rel: "canonical",
      href: `${SITE_URL}/`,
    });
    expect(head.links.some((l) => l.rel === "sitemap")).toBe(true);
  });
});

describe("articleHead", () => {
  const item = {
    id: "abcdef12deadbeef",
    title: "Stripe buys OpenRouter",
    summary: "Payments firm acquires the model gateway.",
    image_url: "https://example.com/og.png",
    category: "Industry",
  };

  it("uses the article summary as meta description and completes share tags", () => {
    const head = articleHead(item);
    expect(metaContent(head.meta, "description")).toBe(item.summary);
    expect(metaContent(head.meta, "og:description")).toBe(item.summary);
    expect(metaContent(head.meta, "twitter:description")).toBe(item.summary);
    expect(metaContent(head.meta, "og:title")).toBe(item.title);
    expect(metaContent(head.meta, "twitter:title")).toBe(item.title);
    expect(metaContent(head.meta, "og:type")).toBe("article");
    expect(metaContent(head.meta, "og:url")).toBe(
      `${SITE_URL}/industry/abcdef12`
    );
    expect(metaContent(head.meta, "og:image")).toBe(item.image_url);
    expect(metaContent(head.meta, "twitter:image")).toBe(item.image_url);
    expect(metaContent(head.meta, "twitter:card")).toBe("summary_large_image");
    expect(head.links).toContainEqual({
      rel: "canonical",
      href: `${SITE_URL}/industry/abcdef12`,
    });
  });

  it("falls back to the site blurb when the article has no summary", () => {
    const head = articleHead({ ...item, summary: null, image_url: null });
    expect(metaContent(head.meta, "description")).toBe(SITE_DESCRIPTION);
    expect(metaContent(head.meta, "og:description")).toBe(SITE_DESCRIPTION);
    expect(metaContent(head.meta, "twitter:card")).toBe("summary");
    expect(metaContent(head.meta, "og:image")).toBeUndefined();
  });

  it("does not invent a Vietnamese description", () => {
    const head = articleHead(item);
    const descriptions = head.meta
      .filter(
        (t) =>
          ("name" in t && t.name === "description") ||
          ("property" in t && t.property === "og:description") ||
          ("name" in t && t.name === "twitter:description")
      )
      .map((t) => ("content" in t ? t.content : ""));
    expect(descriptions.every((d) => d === item.summary)).toBe(true);
  });
});

describe("notFoundHead", () => {
  it("sets a 404 document title, not the homepage title", () => {
    const head = notFoundHead("Không tìm thấy trang | AI News");
    expect(metaContent(head.meta, "title")).toBe(
      "Không tìm thấy trang | AI News"
    );
    expect(metaContent(head.meta, "title")).not.toBe(SITE_TITLE);
    expect(metaContent(head.meta, "robots")).toBe("noindex, follow");
  });
});
