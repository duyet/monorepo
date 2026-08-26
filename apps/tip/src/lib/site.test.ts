import { describe, expect, it } from "vitest";
import {
  KOFI_PROFILE_URL,
  KOFI_URL,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "./site";

describe("tip site config", () => {
  it("exports the Ko-fi embed constants", () => {
    expect(SITE_TITLE).toBe("Tip");
    expect(SITE_DESCRIPTION).toContain("Ko-fi");
    expect(SITE_URL).toBe("https://tip.duyet.net");
    expect(KOFI_URL).toContain("ko-fi.com/duyet");
    expect(KOFI_PROFILE_URL).toBe("https://ko-fi.com/duyet");
  });
});
