import { describe, expect, it } from "vitest";
import { MEMORY_PALETTE } from "./graph-palette";
import { kindSwatch, nodeColor, THEME } from "./graph-theme";

describe("nodeColor", () => {
  it("colors memory nodes by memory type", () => {
    for (const [type, color] of Object.entries(MEMORY_PALETTE)) {
      expect(nodeColor("memory", type, THEME.dark)).toBe(color);
    }
  });

  it("falls back to the article neutral for an unknown memory type", () => {
    expect(nodeColor("memory", "nonexistent", THEME.dark)).toBe(
      THEME.dark.article
    );
    expect(nodeColor("memory", undefined, THEME.dark)).toBe(THEME.dark.article);
  });

  it("colors inbox, tag, and article nodes from the theme", () => {
    expect(nodeColor("inbox", undefined, THEME.light)).toBe(THEME.light.inbox);
    expect(nodeColor("tag", undefined, THEME.light)).toBe(THEME.light.tag);
    expect(nodeColor("article", undefined, THEME.light)).toBe(
      THEME.light.article
    );
  });
});

describe("kindSwatch", () => {
  it("agrees with nodeColor for memory type keys", () => {
    for (const type of Object.keys(MEMORY_PALETTE)) {
      const key = `memory:${type}`;
      expect(kindSwatch(key, THEME.dark)).toBe(
        nodeColor("memory", type, THEME.dark)
      );
    }
  });

  it("agrees with nodeColor for bare kind keys", () => {
    for (const kind of ["article", "inbox", "tag"]) {
      expect(kindSwatch(kind, THEME.dark)).toBe(
        nodeColor(kind, undefined, THEME.dark)
      );
    }
  });

  it("falls back to the article neutral for an unknown memory type key", () => {
    expect(kindSwatch("memory:nonexistent", THEME.dark)).toBe(
      THEME.dark.article
    );
  });
});

describe("THEME", () => {
  it("keeps kind colors stable across light and dark; only chrome flips", () => {
    // Node fill colors are intentionally theme-independent so a node keeps its
    // identity when the user toggles. Only the graph chrome may differ.
    for (const key of ["inbox", "tag"] as const) {
      expect(THEME.light[key]).toBe(THEME.dark[key]);
    }
    for (const key of ["bg", "edge", "edgeHover", "dim", "label"] as const) {
      expect(THEME.light[key]).not.toBe(THEME.dark[key]);
    }
  });
});
