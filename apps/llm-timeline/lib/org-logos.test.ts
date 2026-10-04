import { describe, expect, it } from "vitest";
import { getOrgInitials } from "./org-logos";

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
