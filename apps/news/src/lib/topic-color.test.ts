import { describe, expect, it } from "vitest";
import { TOPIC_COLOR_PALETTE, topicColor } from "./topic-color";

describe("topicColor", () => {
  it("is deterministic: same tag always returns the same colors", () => {
    expect(topicColor("GPT-5")).toEqual(topicColor("GPT-5"));
    expect(topicColor("anthropic")).toEqual(topicColor("anthropic"));
  });

  it("returns the same color across repeated calls (no hidden state)", () => {
    const first = topicColor("open-source");
    for (let i = 0; i < 10; i++) {
      expect(topicColor("open-source")).toEqual(first);
    }
  });

  it("normalizes case: differently-cased tags map to the same color", () => {
    expect(topicColor(" GPT-5 ")).toEqual(topicColor("gpt-5"));
    expect(topicColor("Anthropic")).toEqual(topicColor("anthropic"));
    expect(topicColor("ANTHROPIC")).toEqual(topicColor("anthropic"));
  });

  it("normalizes surrounding whitespace", () => {
    expect(topicColor("  llm  ")).toEqual(topicColor("llm"));
  });

  it("always returns a light/dark pair drawn from the defined palette", () => {
    const sampleTags = [
      "gpt-5",
      "anthropic",
      "openai",
      "open-source",
      "llm",
      "robotics",
      "agents",
      "reasoning",
      "safety",
      "chips",
      "funding",
      "startups",
      "google",
      "meta",
      "research",
    ];
    for (const tag of sampleTags) {
      const color = topicColor(tag);
      const match = TOPIC_COLOR_PALETTE.find(
        (p) => p.light === color.light && p.dark === color.dark
      );
      expect(match).toBeDefined();
      expect(color).toBe(match);
    }
  });

  it("pairs light and dark values from the same palette slot", () => {
    for (const slot of TOPIC_COLOR_PALETTE) {
      expect(typeof slot.light).toBe("string");
      expect(typeof slot.dark).toBe("string");
      expect(slot.light).toMatch(/^#[0-9a-f]{6}$/);
      expect(slot.dark).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("distinct tags can map to different colors (palette is actually used)", () => {
    const tags = [
      "gpt-5",
      "anthropic",
      "openai",
      "open-source",
      "llm",
      "robotics",
      "agents",
      "reasoning",
      "safety",
      "chips",
      "funding",
      "startups",
    ];
    const distinctColors = new Set(tags.map((t) => topicColor(t).light));
    expect(distinctColors.size).toBeGreaterThan(1);
  });
});
