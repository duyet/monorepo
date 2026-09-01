import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_API_BASE,
  DEFAULT_SETTINGS,
  normalizeApiBase,
  normalizeSettings,
} from "./settings.js";

test("normalizeSettings clamps size, count, and unknown enums", () => {
  const settings = normalizeSettings({
    theme: "neon",
    accent: "red",
    font: "comic",
    fontSize: 99,
    language: "fr",
    density: "huge",
    storyCount: 0,
    apiBase: "ftp://evil",
    sections: { tldr: false },
  });

  assert.equal(settings.theme, "system");
  assert.equal(settings.accent, DEFAULT_SETTINGS.accent);
  assert.equal(settings.font, "system");
  assert.equal(settings.fontSize, 20);
  assert.equal(settings.language, "vi");
  assert.equal(settings.density, "compact");
  assert.equal(settings.storyCount, 1);
  assert.equal(settings.tldrCount, 8);
  assert.equal(settings.apiBase, DEFAULT_API_BASE);
  assert.equal(settings.sections.tldr, false);
  assert.equal(settings.sections.stories, true);
});

test("normalizeApiBase keeps host and rejects junk", () => {
  assert.equal(
    normalizeApiBase("https://news.duyet.net/extra"),
    "https://news.duyet.net"
  );
  assert.equal(normalizeApiBase("not a url"), DEFAULT_API_BASE);
  assert.equal(
    normalizeApiBase("http://localhost:3014"),
    "http://localhost:3014"
  );
  assert.equal(normalizeApiBase("http://example.com"), DEFAULT_API_BASE);
});
