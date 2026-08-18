import { describe, expect, it } from "vitest";
import { localizedTitle } from "./display-title";

describe("localizedTitle", () => {
  const translated = {
    title: "Stripe buys OpenRouter",
    title_vi: "Stripe thâu tóm OpenRouter",
  };
  const missing = { title: "Stripe buys OpenRouter", title_vi: null };

  it("uses the Vietnamese title when present in vi UI", () => {
    expect(localizedTitle(translated, "vi")).toEqual({
      text: "Stripe thâu tóm OpenRouter",
      fallbackFromEnglish: false,
    });
  });

  it("falls back to English and flags it when title_vi is missing", () => {
    expect(localizedTitle(missing, "vi")).toEqual({
      text: "Stripe buys OpenRouter",
      fallbackFromEnglish: true,
    });
  });

  it("treats a blank title_vi as missing, not as a translation", () => {
    expect(localizedTitle({ title: "Hello", title_vi: "   " }, "vi")).toEqual({
      text: "Hello",
      fallbackFromEnglish: true,
    });
  });

  it("always uses the English title in en UI", () => {
    expect(localizedTitle(translated, "en")).toEqual({
      text: "Stripe buys OpenRouter",
      fallbackFromEnglish: false,
    });
    expect(localizedTitle(missing, "en").fallbackFromEnglish).toBe(false);
  });
});
