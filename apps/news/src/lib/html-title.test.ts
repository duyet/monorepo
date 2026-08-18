import { describe, expect, it } from "vitest";
import {
  countHtmlTitles,
  firstHtmlTitle,
  firstTitleFromHeadMetas,
  splatOwnsDocumentTitle,
} from "./html-title";
import { notFoundCopy } from "./not-found";
import { notFoundHead } from "./seo";
import { SITE_TITLE } from "./site";

describe("firstHtmlTitle", () => {
  it("returns the first title and ignores a later nested one", () => {
    const html = [
      "<html><head>",
      `<title>${SITE_TITLE}</title>`,
      "</head><body>",
      "<title>Không tìm thấy trang | AI News</title>",
      "</body></html>",
    ].join("");
    expect(firstHtmlTitle(html)).toBe(SITE_TITLE);
    expect(countHtmlTitles(html)).toBe(2);
  });

  it("curl-style: a single 404 title is the first title", () => {
    const title = notFoundCopy("vi").documentTitle;
    const html = `<html><head><title>${title}</title></head><body><h1>404</h1></body></html>`;
    expect(firstHtmlTitle(html)).toBe("Không tìm thấy trang | AI News");
    expect(firstHtmlTitle(html)).not.toBe(SITE_TITLE);
    expect(countHtmlTitles(html)).toBe(1);
  });

  it("curl-style: EN cookie title is not the homepage title", () => {
    const title = notFoundCopy("en").documentTitle;
    const html = `<html><head><title>${title}</title></head><body></body></html>`;
    expect(firstHtmlTitle(html)).toBe("Page not found | AI News");
    expect(countHtmlTitles(html)).toBe(1);
  });
});

describe("splatOwnsDocumentTitle", () => {
  it("is true only for the catch-all 404 route", () => {
    expect(splatOwnsDocumentTitle([{ id: "/$" }])).toBe(true);
    expect(splatOwnsDocumentTitle([{ routeId: "/$" }])).toBe(true);
    expect(splatOwnsDocumentTitle([{ id: "/" }])).toBe(false);
    expect(splatOwnsDocumentTitle([])).toBe(false);
  });
});

describe("firstTitleFromHeadMetas", () => {
  it("uses the not-found route title when root omits title", () => {
    const owned = notFoundHead(notFoundCopy("vi").documentTitle).meta.filter(
      (t): t is { title: string } => "title" in t
    );
    const rootWithoutTitle: Array<{ title?: string }> = [];
    expect(firstTitleFromHeadMetas([rootWithoutTitle, owned])).toBe(
      "Không tìm thấy trang | AI News"
    );
    expect(firstTitleFromHeadMetas([rootWithoutTitle, owned])).not.toBe(
      SITE_TITLE
    );
  });

  it("reproduces the live bug when root still emits SITE_TITLE first", () => {
    const owned = notFoundHead(notFoundCopy("vi").documentTitle).meta.filter(
      (t): t is { title: string } => "title" in t
    );
    expect(firstTitleFromHeadMetas([[{ title: SITE_TITLE }], owned])).toBe(
      SITE_TITLE
    );
  });
});
