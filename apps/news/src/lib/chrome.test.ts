import { describe, expect, it } from "vitest";
import {
  COMPACT_CHROME_CLASS,
  PHONE_PREFS_TRIGGER_CLASS,
  PHONE_TAP_TARGET_CLASS,
  WIDE_CHROME_CLASS,
  WIDE_HEADER_ROW_CLASS,
} from "./chrome";

describe("phone chrome", () => {
  it("requires 44px tap targets on phone controls", () => {
    expect(PHONE_TAP_TARGET_CLASS).toContain("min-h-[44px]");
    expect(PHONE_TAP_TARGET_CLASS).toContain("min-w-[44px]");
    expect(PHONE_TAP_TARGET_CLASS).toContain("h-11");
    expect(PHONE_TAP_TARGET_CLASS).toContain("w-11");
    expect(PHONE_PREFS_TRIGGER_CLASS).toContain("min-h-[44px]");
  });

  it("keeps wide and compact chrome on separate class hooks", () => {
    expect(WIDE_CHROME_CLASS).toBe("news-wide-chrome");
    expect(COMPACT_CHROME_CLASS).toBe("news-compact-chrome");
    expect(WIDE_HEADER_ROW_CLASS).toBe("news-wide-row");
    expect(WIDE_CHROME_CLASS).not.toBe(COMPACT_CHROME_CLASS);
  });
});
