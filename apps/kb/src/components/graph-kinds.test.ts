import { describe, expect, it } from "vitest";
import type { GraphNode, NodeKind } from "../../lib/graph-types";
import {
  baseKind,
  KIND_LABEL,
  MEMORY_KEY_PREFIX,
  memoryTypeOfKey,
  nodeKindKey,
} from "./graph-kinds";
import { kindSwatch, nodeColor, THEME } from "./graph-theme";

function node(over: Partial<GraphNode> = {}): GraphNode {
  return {
    id: "n",
    label: "n",
    kind: "article",
    href: "/k/n",
    tags: [],
    description: "",
    updated: "",
    ...over,
  };
}

describe("nodeKindKey", () => {
  it("keys memory nodes by their memory type so each is separately filterable", () => {
    expect(nodeKindKey(node({ kind: "memory", memoryType: "user" }))).toBe(
      "memory:user"
    );
    expect(nodeKindKey(node({ kind: "memory", memoryType: "tech" }))).toBe(
      "memory:tech"
    );
  });

  it("falls back to `other` for a memory node with no type", () => {
    expect(nodeKindKey(node({ kind: "memory" }))).toBe("memory:other");
  });

  it("keys every other kind by its bare kind", () => {
    for (const kind of ["article", "inbox", "tag"] as const) {
      expect(nodeKindKey(node({ kind }))).toBe(kind);
    }
  });
});

describe("kind key parsing", () => {
  it("baseKind strips the memory-type suffix", () => {
    expect(baseKind("memory:user")).toBe("memory");
    expect(baseKind("memory:")).toBe("memory");
    for (const kind of ["article", "inbox", "tag"] as const) {
      expect(baseKind(kind)).toBe(kind);
    }
  });

  it("memoryTypeOfKey returns the suffix, or undefined for a bare kind", () => {
    expect(memoryTypeOfKey("memory:user")).toBe("user");
    expect(memoryTypeOfKey("memory:")).toBe("");
    expect(memoryTypeOfKey("tag")).toBeUndefined();
    expect(memoryTypeOfKey("article")).toBeUndefined();
  });

  it("round-trips the key nodeKindKey built", () => {
    const key = nodeKindKey(node({ kind: "memory", memoryType: "project" }));
    expect(baseKind(key)).toBe("memory");
    expect(memoryTypeOfKey(key)).toBe("project");
  });

  it("keeps the prefix the Sigma nodeKind attribute and the chips both index on", () => {
    expect(MEMORY_KEY_PREFIX).toBe("memory:");
    for (const type of ["user", "tech", "", "unknown-type"]) {
      expect(memoryTypeOfKey(`${MEMORY_KEY_PREFIX}${type}`)).toBe(type);
    }
  });
});

describe("KIND_LABEL", () => {
  it("labels every kind, so a new kind cannot reach a chip unlabelled", () => {
    const kinds: NodeKind[] = ["article", "memory", "inbox", "tag"];
    expect(Object.keys(KIND_LABEL).sort()).toEqual([...kinds].sort());
    for (const kind of kinds) expect(KIND_LABEL[kind]).toBeTruthy();
  });

  it("labels a memory key with its base kind's label plus the type", () => {
    const key = nodeKindKey(node({ kind: "memory", memoryType: "user" }));
    expect(`${KIND_LABEL[baseKind(key)]}: ${memoryTypeOfKey(key)}`).toBe(
      "Memory: user"
    );
  });
});

describe("agreement with the theme resolvers", () => {
  it("a kind key's chip swatch equals the fill color of the node it came from", () => {
    // The chip swatch (kindSwatch) and the node fill (nodeColor) are separate
    // resolvers over the same key; if they disagree the chips lie about the
    // graph. This is the invariant that already broke once.
    for (const n of [
      node({ kind: "memory", memoryType: "user" }),
      node({ kind: "memory", memoryType: "nonexistent" }),
      node({ kind: "memory" }),
      node({ kind: "article" }),
      node({ kind: "inbox" }),
      node({ kind: "tag" }),
    ]) {
      expect(kindSwatch(nodeKindKey(n), THEME.dark)).toBe(
        nodeColor(n.kind, n.memoryType, THEME.dark)
      );
    }
  });
});
