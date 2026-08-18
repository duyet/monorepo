import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { notFoundLangFromCookie } from "./not-found-fn";
import { notFoundCopy } from "./not-found";
import { notFoundHead } from "./seo";
import { SITE_TITLE } from "./site";

const here = dirname(fileURLToPath(import.meta.url));

describe("notFoundLangFromCookie", () => {
  it("defaults to vi without a cookie", () => {
    expect(notFoundLangFromCookie(null)).toBe("vi");
  });

  it("reads news_lang=en from the cookie", () => {
    expect(notFoundLangFromCookie("foo=1; news_lang=en; bar=2")).toBe("en");
  });

  it("feeds the localized 404 title, not the homepage title", () => {
    const title = notFoundCopy(notFoundLangFromCookie(null)).documentTitle;
    expect(title).toBe("Không tìm thấy trang | AI News");
    expect(title).not.toBe(SITE_TITLE);
    expect(
      notFoundHead(title).meta.some((t) => "title" in t && t.title === title)
    ).toBe(true);
  });
});

describe("404 splat import boundary", () => {
  it("does not import server modules from the client route", () => {
    const src = readFileSync(join(here, "../routes/$.tsx"), "utf8");
    expect(src).not.toMatch(/from\s+["']@tanstack\/react-start\/server["']/);
    expect(src).not.toMatch(/from\s+["'][^"']*\.server["']/);
    expect(src).toContain("throw notFound()");
  });

  it("reads news_lang inside createIsomorphicFn.server", () => {
    const src = readFileSync(join(here, "./not-found-fn.ts"), "utf8");
    expect(src).toContain("createIsomorphicFn");
    expect(src).toContain("notFoundLangFromCookie");
    expect(src).toContain("getRequestHeader");
  });

  it("keeps a single title owner: NotFoundPage has no nested title", () => {
    const page = readFileSync(
      join(here, "../components/NotFoundPage.tsx"),
      "utf8"
    );
    expect(page).not.toMatch(/<title\b/);
    expect(page).not.toContain("useEffect");
    expect(page).not.toContain("document.title");
  });
});
