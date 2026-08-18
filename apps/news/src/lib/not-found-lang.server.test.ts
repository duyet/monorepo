import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { notFoundCopy } from "./not-found";
import { notFoundHead } from "./seo";
import { SITE_TITLE } from "./site";

const mocks = vi.hoisted(() => ({
  setResponseStatus: vi.fn(),
  getRequestHeader: vi.fn(),
}));

vi.mock("@tanstack/react-start/server", () => ({
  setResponseStatus: mocks.setResponseStatus,
  getRequestHeader: mocks.getRequestHeader,
}));

import { notFoundLang } from "./not-found-lang.server";

const here = dirname(fileURLToPath(import.meta.url));

describe("notFoundLang", () => {
  beforeEach(() => {
    mocks.setResponseStatus.mockReset();
    mocks.getRequestHeader.mockReset();
  });

  it("sets HTTP 404 and defaults to vi without a cookie", () => {
    mocks.getRequestHeader.mockReturnValue(null);
    expect(notFoundLang()).toBe("vi");
    expect(mocks.setResponseStatus).toHaveBeenCalledWith(404);
    expect(mocks.getRequestHeader).toHaveBeenCalledWith("cookie");
  });

  it("reads news_lang=en from the cookie", () => {
    mocks.getRequestHeader.mockReturnValue("foo=1; news_lang=en; bar=2");
    expect(notFoundLang()).toBe("en");
    expect(mocks.setResponseStatus).toHaveBeenCalledWith(404);
  });

  it("feeds the localized 404 title, not the homepage title", () => {
    mocks.getRequestHeader.mockReturnValue(null);
    const title = notFoundCopy(notFoundLang()).documentTitle;
    expect(title).toBe("Không tìm thấy trang | AI News");
    expect(title).not.toBe(SITE_TITLE);
    expect(
      notFoundHead(title).meta.some((t) => "title" in t && t.title === title)
    ).toBe(true);
  });
});

describe("catch-all 404 route stays client-safe", () => {
  it("does not mention @tanstack/react-start/server in the splat route", () => {
    const splat = readFileSync(join(here, "../routes", "$.tsx"), "utf8");
    expect(splat).not.toContain("@tanstack/react-start/server");
    expect(splat).toContain("not-found-lang.server");
    const code = splat.split("\n").filter((l) => !l.trimStart().startsWith("//")).join("\n");
    expect(code).not.toContain("throw notFound");
  });

  it("keeps a single title owner: NotFoundPage has no nested title or useEffect", () => {
    const page = readFileSync(
      join(here, "../components/NotFoundPage.tsx"),
      "utf8"
    );
    expect(page.includes("<title")).toBe(false);
    expect(page).not.toContain("useEffect");
    expect(page).not.toContain("document.title");
  });
});
