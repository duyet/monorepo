import { ogMeta } from "@duyet/config/og";
import { describe, expect, it } from "vitest";
import {
  ogAbsolute,
  ogCardName,
  ogCardPath,
  ogNoteCardPath,
  OG_INDEX_CARD,
  OG_ORIGIN,
} from "../og";

/**
 * These guard the contract between `scripts/generate-og.ts` (which writes the
 * PNGs) and the route `head()` functions (which reference them). A drift here
 * means every `og:image` on the live site 404s, and only a crawler finds out.
 */
describe("ogCardPath", () => {
  it("keys a post card on year-month-slug", () => {
    expect(ogCardPath("/2026/09/i-dont-read-code-anymore")).toBe(
      "/og/2026-09-i-dont-read-code-anymore.png",
    );
  });

  it("keeps every path segment so child posts cannot collide", () => {
    expect(ogCardName("/2026/01/coding-agent/opencode")).toBe(
      "2026-01-coding-agent-opencode",
    );
    // distinct from a hypothetical top-level post with the same last segment
    expect(ogCardPath("/2026/01/coding-agent/opencode")).not.toBe(
      ogCardPath("/2026/01/opencode"),
    );
  });

  it("tolerates .md/.html suffixes and a missing leading slash", () => {
    expect(ogCardName("/2026/09/foo.md")).toBe("2026-09-foo");
    expect(ogCardName("/2026/09/foo.html")).toBe("2026-09-foo");
    expect(ogCardName("2026/09/foo")).toBe("2026-09-foo");
  });

  it("strips characters that are not filename-safe", () => {
    expect(ogCardName("/2026/09/a b?c")).toBe("2026-09-a-b-c");
  });
});

describe("ogNoteCardPath", () => {
  it("namespaces notes so they cannot collide with post cards", () => {
    expect(ogNoteCardPath("ax")).toBe("/og/note-ax.png");
  });
});

describe("ogAbsolute", () => {
  it("makes a relative card path absolute against the site origin", () => {
    expect(ogAbsolute("/og/index.png")).toBe(`${OG_ORIGIN}/og/index.png`);
  });

  it("leaves an already-absolute URL alone", () => {
    const url = "https://cdn.example.com/a.png";
    expect(ogAbsolute(url)).toBe(url);
  });
});

describe("card contract", () => {
  it("produces a summary_large_image card for a generated post card", () => {
    const image = ogAbsolute(ogCardPath("/2026/09/i-dont-read-code-anymore"));
    const meta = ogMeta({
      url: `${OG_ORIGIN}/2026/09/i-dont-read-code-anymore`,
      title: "I don't read code anymore",
      description: "It's been a year or two.",
      image,
      type: "article",
    });
    const byName = (n: string) => meta.find((m) => m.name === n)?.content;
    const byProp = (p: string) => meta.find((m) => m.property === p)?.content;

    expect(byProp("og:image")).toBe(image);
    expect(byProp("og:image:width")).toBe("1200");
    expect(byProp("og:image:height")).toBe("630");
    expect(byName("twitter:image")).toBe(image);
    expect(byName("twitter:card")).toBe("summary_large_image");
  });

  it("has a real site-wide default card to point at", () => {
    expect(OG_INDEX_CARD).toBe("/og/index.png");
    expect(ogAbsolute(OG_INDEX_CARD)).toBe(`${OG_ORIGIN}/og/index.png`);
  });
});
