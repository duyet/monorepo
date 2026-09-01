import assert from "node:assert/strict";
import { test } from "node:test";
import { highlightTitle, tagsForHighlight, TITLE_KEYWORDS } from "./highlight.js";

test("returns a single unhighlighted segment when there are no tags", () => {
  assert.deepEqual(highlightTitle("Anthropic ships Claude 5", []), [
    { text: "Anthropic ships Claude 5", highlighted: false },
  ]);
});

test("highlights a single matching tag case-insensitively", () => {
  assert.deepEqual(highlightTitle("Anthropic ships Claude 5", ["anthropic"]), [
    { text: "Anthropic", highlighted: true, tag: "anthropic" },
    { text: " ships Claude 5", highlighted: false },
  ]);
});

test("matches hyphenated tags against the spaced spelling", () => {
  assert.deepEqual(
    highlightTitle("New open source model released", ["open-source"]),
    [
      { text: "New ", highlighted: false },
      { text: "open source", highlighted: true, tag: "open-source" },
      { text: " model released", highlighted: false },
    ]
  );
});

test("does not highlight a needle embedded in a larger word", () => {
  const segments = highlightTitle("SpaceXAI Opens Grok Build to All", [
    "SpaceX",
    "xAI",
    "Grok",
  ]);
  assert.deepEqual(
    segments.filter((s) => s.highlighted).map((s) => s.text),
    ["Grok"]
  );
});

test("caps highlights at 3 distinct tags", () => {
  const segments = highlightTitle("Alpha Beta Gamma Delta all launch today", [
    "alpha",
    "beta",
    "gamma",
    "delta",
  ]);
  assert.ok(segments.filter((s) => s.highlighted).length <= 3);
});

test("segments join back to the original title", () => {
  const title = "Anthropic and OpenAI ship new models";
  const segments = highlightTitle(title, ["anthropic", "openai", "models"]);
  assert.equal(segments.map((s) => s.text).join(""), title);
});

test("TITLE_KEYWORDS fallback highlights well-known entities", () => {
  const segments = highlightTitle(
    "Anthropic and OpenAI ship GPT-5.6 Sol",
    tagsForHighlight([])
  );
  const highlighted = segments.filter((s) => s.highlighted).map((s) => s.text);
  assert.ok(highlighted.includes("Anthropic"));
  assert.ok(highlighted.includes("OpenAI"));
  assert.ok(highlighted.includes("GPT"));
});

test("item tags stay ahead of fallback keywords", () => {
  assert.equal(tagsForHighlight(["openai"])[0], "openai");
  assert.ok(TITLE_KEYWORDS.includes("OpenAI"));
});
