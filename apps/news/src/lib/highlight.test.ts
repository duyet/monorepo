import { describe, expect, it } from "vitest";
import { highlightTitle, tagsForHighlight } from "./highlight";

describe("highlightTitle", () => {
  it("returns a single unhighlighted segment when there are no tags", () => {
    expect(highlightTitle("Anthropic ships Claude 5", [])).toEqual([
      { text: "Anthropic ships Claude 5", highlighted: false },
    ]);
  });

  it("returns a single unhighlighted segment when no tag matches", () => {
    expect(highlightTitle("Anthropic ships Claude 5", ["openai"])).toEqual([
      { text: "Anthropic ships Claude 5", highlighted: false },
    ]);
  });

  it("highlights a single matching tag case-insensitively", () => {
    expect(highlightTitle("Anthropic ships Claude 5", ["anthropic"])).toEqual([
      { text: "Anthropic", highlighted: true, tag: "anthropic" },
      { text: " ships Claude 5", highlighted: false },
    ]);
  });

  it("matches multi-word hyphenated tags against the spaced spelling", () => {
    expect(
      highlightTitle("New open source model released", ["open-source"])
    ).toEqual([
      { text: "New ", highlighted: false },
      { text: "open source", highlighted: true, tag: "open-source" },
      { text: " model released", highlighted: false },
    ]);
  });

  it("highlights multiple distinct non-overlapping tags", () => {
    const segments = highlightTitle("Anthropic and OpenAI race on models", [
      "anthropic",
      "openai",
    ]);
    const highlighted = segments
      .filter((s) => s.highlighted)
      .map((s) => s.text);
    expect(highlighted).toEqual(["Anthropic", "OpenAI"]);
  });

  it("does not double-highlight overlapping tag matches", () => {
    // "open source" contains "open" — only the longer match should win.
    const segments = highlightTitle("An open source release", [
      "open",
      "open source",
    ]);
    const highlighted = segments.filter((s) => s.highlighted);
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0].text.toLowerCase()).toBe("open source");
  });

  it("caps highlights at 3 distinct tags", () => {
    const title = "Alpha Beta Gamma Delta all launch today";
    const segments = highlightTitle(title, ["alpha", "beta", "gamma", "delta"]);
    const highlighted = segments.filter((s) => s.highlighted);
    expect(highlighted.length).toBeLessThanOrEqual(3);
  });

  it("segments join back to the original title", () => {
    const title = "Anthropic and OpenAI ship new models";
    const segments = highlightTitle(title, ["anthropic", "openai", "models"]);
    expect(segments.map((s) => s.text).join("")).toBe(title);
  });

  it("returns the whole title unhighlighted for an empty title", () => {
    expect(highlightTitle("", ["anthropic"])).toEqual([
      { text: "", highlighted: false },
    ]);
  });

  describe("tag attribution", () => {
    it("attaches the matched tag to each highlighted segment", () => {
      const segments = highlightTitle("Anthropic and OpenAI race on models", [
        "anthropic",
        "openai",
      ]);
      const highlighted = segments.filter((s) => s.highlighted);
      expect(highlighted).toEqual([
        { text: "Anthropic", highlighted: true, tag: "anthropic" },
        { text: "OpenAI", highlighted: true, tag: "openai" },
      ]);
    });

    it("preserves the original tag's case, not lowercased", () => {
      const segments = highlightTitle("New GPT-5 model announced", ["GPT-5"]);
      const highlighted = segments.filter((s) => s.highlighted);
      expect(highlighted).toHaveLength(1);
      expect(highlighted[0].tag).toBe("GPT-5");
    });

    it("attributes a hyphenated tag even when matched via its spaced spelling", () => {
      const segments = highlightTitle("New open source model released", [
        "open-source",
      ]);
      const highlighted = segments.filter((s) => s.highlighted);
      expect(highlighted).toHaveLength(1);
      // The matched text is the spaced spelling found in the title, but the
      // attributed tag is the original hyphenated input, not "open source".
      expect(highlighted[0].text).toBe("open source");
      expect(highlighted[0].tag).toBe("open-source");
    });

    it("highlights well-known entities when item tags are empty", () => {
      const tags = tagsForHighlight([]);
      const segments = highlightTitle(
        "Anthropic and OpenAI ship GPT-5.6 Sol",
        tags
      );
      const highlighted = segments.filter((s) => s.highlighted).map((s) => s.text);
      expect(highlighted).toEqual(expect.arrayContaining(["Anthropic", "OpenAI", "GPT"]));
    });

    it("keeps the item's own tags ahead of fallback keywords", () => {
      expect(tagsForHighlight(["openai"])[0]).toBe("openai");
    });

    it("does not attach a tag to unhighlighted segments", () => {
      const segments = highlightTitle("Anthropic ships Claude 5", [
        "anthropic",
      ]);
      const unhighlighted = segments.filter((s) => !s.highlighted);
      for (const s of unhighlighted) {
        expect(s.tag).toBeUndefined();
      }
    });
  });
});
