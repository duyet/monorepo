import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  decodeHtmlEntities,
  enrichMissingContent,
  parseOgTags,
} from "../enrich.js";
import type { FetchedItem } from "../sources/types.js";

describe("decodeHtmlEntities", () => {
  it("decodes named entities", () => {
    expect(decodeHtmlEntities("Tom &amp; Jerry")).toBe("Tom & Jerry");
    expect(decodeHtmlEntities("&lt;b&gt;bold&lt;/b&gt;")).toBe("<b>bold</b>");
    expect(decodeHtmlEntities("&ldquo;quoted&rdquo;")).toBe("“quoted”");
  });

  it("decodes decimal and hex numeric entities", () => {
    expect(decodeHtmlEntities("&#65;&#66;&#67;")).toBe("ABC");
    expect(decodeHtmlEntities("&#x41;&#x42;")).toBe("AB");
  });

  it("leaves unknown named entities untouched", () => {
    expect(decodeHtmlEntities("&unknownentity;")).toBe("&unknownentity;");
  });
});

describe("parseOgTags", () => {
  it("extracts og:image and og:description", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="A Story" />
        <meta property="og:image" content="https://example.com/hero.png" />
        <meta property="og:description" content="A short description." />
      </head></html>
    `;
    expect(parseOgTags(html)).toEqual({
      imageUrl: "https://example.com/hero.png",
      description: "A short description.",
    });
  });

  it("falls back to <meta name=description> when there's no og:description", () => {
    const html = `<meta name="description" content="Fallback description">`;
    expect(parseOgTags(html)).toEqual({
      imageUrl: undefined,
      description: "Fallback description",
    });
  });

  it("prefers og:description over the fallback description tag", () => {
    const html = `
      <meta name="description" content="Fallback">
      <meta property="og:description" content="Preferred">
    `;
    expect(parseOgTags(html).description).toBe("Preferred");
  });

  it("handles content= before the property/name attribute", () => {
    const html = `<meta content="https://example.com/img.jpg" property="og:image">`;
    expect(parseOgTags(html).imageUrl).toBe("https://example.com/img.jpg");
  });

  it("decodes HTML entities in the description", () => {
    const html = `<meta property="og:description" content="Tom &amp; Jerry&#39;s &ldquo;show&rdquo;">`;
    // &#39; isn't in NAMED_ENTITIES but IS a numeric entity, decoded regardless
    expect(parseOgTags(html).description).toBe("Tom & Jerry's “show”");
  });

  it("rejects a relative og:image URL rather than fabricating an absolute one", () => {
    const html = `<meta property="og:image" content="/images/hero.png">`;
    expect(parseOgTags(html).imageUrl).toBeUndefined();
  });

  it("rejects a non-http(s) og:image URL (e.g. data: URI)", () => {
    const html = `<meta property="og:image" content="data:image/png;base64,abc">`;
    expect(parseOgTags(html).imageUrl).toBeUndefined();
  });

  it("returns an empty object when neither tag is present", () => {
    expect(parseOgTags("<html><head></head></html>")).toEqual({
      imageUrl: undefined,
      description: undefined,
    });
  });
});

function makeItem(overrides: Partial<FetchedItem> = {}): FetchedItem {
  return {
    url: "https://example.com/story",
    title: "A story",
    publishedAt: 1700000000,
    ...overrides,
  };
}

function htmlResponse(html: string, contentType = "text/html; charset=utf-8") {
  return new Response(html, {
    status: 200,
    headers: { "content-type": contentType },
  });
}

describe("enrichMissingContent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fills in summary and imageUrl for an item missing both", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        htmlResponse(
          `<meta property="og:image" content="https://example.com/og.png">
           <meta property="og:description" content="Fetched description">`
        )
      )
    );

    const item = makeItem();
    await enrichMissingContent([item]);

    expect(item.imageUrl).toBe("https://example.com/og.png");
    expect(item.summary).toBe("Fetched description");
  });

  it("never overwrites a summary the adapter already provided (e.g. huggingnews body)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        htmlResponse(
          `<meta property="og:image" content="https://example.com/og.png">
           <meta property="og:description" content="Should be ignored">`
        )
      )
    );

    const item = makeItem({ summary: "Original adapter summary" });
    await enrichMissingContent([item]);

    expect(item.summary).toBe("Original adapter summary");
    // imageUrl was still missing, so it's still filled in
    expect(item.imageUrl).toBe("https://example.com/og.png");
  });

  it("skips items that already have both fields — never fetches them", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const item = makeItem({
      summary: "Already have this",
      imageUrl: "https://example.com/already.png",
    });
    await enrichMissingContent([item]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("only reads text/html responses, ignoring e.g. a PDF or JSON URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("%PDF-1.4 ...", {
          status: 200,
          headers: { "content-type": "application/pdf" },
        })
      )
    );

    const item = makeItem();
    await enrichMissingContent([item]);

    expect(item.summary).toBeUndefined();
    expect(item.imageUrl).toBeUndefined();
  });

  it("swallows a fetch failure for one item without affecting others", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(
        htmlResponse(
          `<meta property="og:description" content="Second item works">`
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    const failing = makeItem({ url: "https://example.com/a" });
    const working = makeItem({ url: "https://example.com/b" });
    await enrichMissingContent([failing, working]);

    expect(failing.summary).toBeUndefined();
    expect(working.summary).toBe("Second item works");
  });

  it("caps the number of fetches at 20, ignoring the rest", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () =>
        htmlResponse(`<meta property="og:description" content="d">`)
      );
    vi.stubGlobal("fetch", fetchMock);

    const items = Array.from({ length: 25 }, (_, i) =>
      makeItem({ url: `https://example.com/${i}` })
    );
    await enrichMissingContent(items);

    expect(fetchMock).toHaveBeenCalledTimes(20);
  });

  it("never throws even when every fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const items = [makeItem()];
    await expect(enrichMissingContent(items)).resolves.toBeUndefined();
  });
});
