import { describe, expect, it } from "vitest";
import { isSearchFocusShortcut } from "./search-bar";

describe("isSearchFocusShortcut", () => {
  it("focuses on / and s without modifiers", () => {
    expect(
      isSearchFocusShortcut({
        key: "/",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
      }),
    ).toBe(true);
    expect(
      isSearchFocusShortcut({
        key: "s",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
      }),
    ).toBe(true);
  });

  it("does not hijack Ctrl/Cmd+S or Alt+/", () => {
    expect(
      isSearchFocusShortcut({
        key: "s",
        ctrlKey: true,
        metaKey: false,
        altKey: false,
      }),
    ).toBe(false);
    expect(
      isSearchFocusShortcut({
        key: "s",
        ctrlKey: false,
        metaKey: true,
        altKey: false,
      }),
    ).toBe(false);
    expect(
      isSearchFocusShortcut({
        key: "/",
        ctrlKey: false,
        metaKey: false,
        altKey: true,
      }),
    ).toBe(false);
  });
});
