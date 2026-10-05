import { describe, expect, it } from "vitest";
import {
  getOrgInitials,
  getOrgLogoUrl,
  getOrgColor,
  isPerceivedDark,
} from "./org-logos";

describe("getOrgInitials", () => {
  it("takes the first letter of each of the first two words", () => {
    expect(getOrgInitials("Google DeepMind")).toBe("GD");
    expect(getOrgInitials("Mistral AI")).toBe("MA");
  });

  it("splits on dashes and underscores too", () => {
    expect(getOrgInitials("DeepSeek-AI")).toBe("DA");
    expect(getOrgInitials("meta_ai")).toBe("MA");
  });

  it("returns a single letter for a one-word org", () => {
    expect(getOrgInitials("OpenAI")).toBe("O");
    expect(getOrgInitials("xAI")).toBe("X");
  });

  it("ignores words beyond the first two", () => {
    expect(getOrgInitials("Hugging Face Research Lab")).toBe("HF");
  });
});

describe("getOrgLogoUrl", () => {
  it("returns the CDN URL for a mapped org and null otherwise", () => {
    expect(getOrgLogoUrl("Anthropic", true)).toBe(
      "https://cdn.simpleicons.org/anthropic/ffffff",
    );
    expect(getOrgLogoUrl("No Such Lab")).toBeNull();
  });
});

describe("getOrgColor", () => {
  it("picks a stable class pair from the org name", () => {
    expect(getOrgColor("OpenAI")).toBe(
      "bg-[color-mix(in_srgb,var(--rd-accent)_10%,var(--rd-surface))] text-[var(--rd-accent-ink)]",
    );
    expect(getOrgColor("Google")).toBe(
      "bg-[var(--rd-surface-2)] text-[var(--rd-text-2)]",
    );
  });
});

describe("isPerceivedDark", () => {
  it("returns the real luminance check for a small hex fixture", () => {
    expect(isPerceivedDark("000000")).toBe(true);
    expect(isPerceivedDark("ffffff")).toBe(false);
    expect(isPerceivedDark("808080")).toBe(false);
    expect(isPerceivedDark("#000000")).toBe(false);
  });
});
