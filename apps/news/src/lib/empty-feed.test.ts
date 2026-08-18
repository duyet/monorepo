import { describe, expect, it } from "vitest";
import { emptyFeedCopy, showFeedBrowseChrome } from "./empty-feed";

describe("emptyFeedCopy", () => {
  it("uses search-specific copy when a query is present", () => {
    expect(
      emptyFeedCopy({ lang: "vi", q: "zzzz", selectedCategoryCount: 0 })
    ).toBe("Không tìm thấy tin cho “zzzz”.");
    expect(
      emptyFeedCopy({ lang: "en", q: "zzzz", selectedCategoryCount: 0 })
    ).toBe("No stories match “zzzz”.");
  });

  it("does not reuse the site-empty line for a failed search", () => {
    const vi = emptyFeedCopy({
      lang: "vi",
      q: "zzzz",
      selectedCategoryCount: 0,
    });
    const en = emptyFeedCopy({
      lang: "en",
      q: "zzzz",
      selectedCategoryCount: 0,
    });
    expect(vi).not.toBe("Chưa có tin nào.");
    expect(en).not.toBe("No stories yet.");
  });

  it("keeps filter-empty and site-empty copy distinct when not searching", () => {
    expect(emptyFeedCopy({ lang: "vi", selectedCategoryCount: 1 })).toBe(
      "Không có tin phù hợp với bộ lọc."
    );
    expect(emptyFeedCopy({ lang: "vi", selectedCategoryCount: 0 })).toBe(
      "Chưa có tin nào."
    );
  });
});

describe("showFeedBrowseChrome", () => {
  it("hides global chips on a search view", () => {
    expect(showFeedBrowseChrome("openrouter")).toBe(false);
    expect(showFeedBrowseChrome(undefined)).toBe(true);
  });
});
