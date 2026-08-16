import { describe, expect, it } from "vitest";
import { isValidEmail } from "../subscribe/handlers.js";
import {
  buildDigestEmail,
  shouldSendDigest,
  topBullets,
} from "../subscribe/send.js";

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("a.b+c@sub.example.co")).toBe(true);
  });

  it("rejects malformed addresses and non-strings", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
  });

  it("rejects overlong addresses", () => {
    const long = `${"a".repeat(250)}@example.com`;
    expect(isValidEmail(long)).toBe(false);
  });
});

describe("topBullets", () => {
  it("caps at 5 bullets by default", () => {
    const bullets = Array.from({ length: 8 }, (_, i) => ({ text: `b${i}` }));
    expect(topBullets(JSON.stringify(bullets))).toHaveLength(5);
  });

  it("returns empty for null/invalid JSON/non-array", () => {
    expect(topBullets(null)).toEqual([]);
    expect(topBullets("not json")).toEqual([]);
    expect(topBullets(JSON.stringify({ a: 1 }))).toEqual([]);
  });
});

describe("shouldSendDigest", () => {
  it("returns false once already sent", () => {
    expect(
      shouldSendDigest({
        bullets_en: JSON.stringify([{ text: "a" }]),
        bullets_vi: null,
        sent_at: Date.now(),
      })
    ).toBe(false);
  });

  it("returns false when both languages are empty", () => {
    expect(
      shouldSendDigest({ bullets_en: null, bullets_vi: null, sent_at: null })
    ).toBe(false);
  });

  it("returns true when unsent and either language has bullets", () => {
    expect(
      shouldSendDigest({
        bullets_en: JSON.stringify([{ text: "a" }]),
        bullets_vi: null,
        sent_at: null,
      })
    ).toBe(true);
  });
});

describe("buildDigestEmail", () => {
  const bullets = Array.from({ length: 7 }, (_, i) => ({ text: `story ${i}` }));

  it("caps the email body at 5 bullets", () => {
    const { text, html } = buildDigestEmail("2026-08-16", bullets, "en", "tok");
    expect(text).toContain("story 0");
    expect(text).toContain("story 4");
    expect(text).not.toContain("story 5");
    expect(html).not.toContain("story 5");
  });

  it("selects the Vietnamese unsubscribe copy for lang=vi", () => {
    const { text } = buildDigestEmail("2026-08-16", bullets, "vi", "tok");
    expect(text).toContain("Hủy đăng ký");
  });

  it("selects the English unsubscribe copy for lang=en", () => {
    const { text } = buildDigestEmail("2026-08-16", bullets, "en", "tok");
    expect(text).toContain("Unsubscribe:");
  });

  it("includes the unsubscribe link with the given token", () => {
    const { html } = buildDigestEmail("2026-08-16", bullets, "en", "abc123");
    expect(html).toContain(
      "https://news.duyet.net/subscribe?unsubscribe=abc123"
    );
  });

  it("escapes HTML-sensitive characters in bullet text", () => {
    const { html } = buildDigestEmail(
      "2026-08-16",
      [{ text: '<script>alert(1)</script> & "quoted"' }],
      "en",
      "tok"
    );
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;quoted&quot;");
  });
});
