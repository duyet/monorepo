import { describe, expect, it } from "vitest";
import type { GraphData, GraphEdge, GraphNode } from "../../lib/graph-types";
import {
  buildBacklinks,
  buildDegree,
  buildNodeMap,
  listKindKeys,
  rawMdUrl,
  visibleSubset,
} from "./graph-derive";

function node(over: Partial<GraphNode> & { id: string }): GraphNode {
  return {
    label: over.id,
    kind: "article",
    href: `/k/${over.id}`,
    tags: [],
    description: "",
    updated: "",
    ...over,
  };
}

function edge(source: string, target: string, kind: "link" | "tag" = "link") {
  return { source, target, kind } satisfies GraphEdge;
}

/**
 *   article ── tag ── memory/user
 *      │                     ▲
 *      └─────────────────────┘   (article → user)
 *   island                    (no edges)
 */
const FIXTURE: GraphData = {
  generated: "2026-01-01T00:00:00.000Z",
  nodes: [
    node({ id: "article" }),
    node({ id: "user", kind: "memory", memoryType: "user", href: "/m/user" }),
    node({ id: "island" }),
    node({ id: "#tag", kind: "tag", href: "" }),
  ],
  edges: [edge("article", "#tag", "tag"), edge("article", "user")],
};

describe("buildNodeMap", () => {
  it("indexes every node by id", () => {
    const map = buildNodeMap(FIXTURE);
    expect(Object.keys(map).sort()).toEqual([
      "#tag",
      "article",
      "island",
      "user",
    ]);
    expect(map.user.memoryType).toBe("user");
  });

  it("is empty for missing data", () => {
    expect(buildNodeMap(null)).toEqual({});
    expect(buildNodeMap(undefined)).toEqual({});
  });
});

describe("buildDegree", () => {
  it("counts an edge once for each endpoint", () => {
    expect(buildDegree(FIXTURE)).toEqual({ article: 2, "#tag": 1, user: 1 });
  });

  it("is empty for missing data", () => {
    expect(buildDegree(null)).toEqual({});
  });
});

describe("buildBacklinks", () => {
  it("maps each target to the distinct sources pointing at it", () => {
    expect(buildBacklinks(FIXTURE)).toEqual({
      "#tag": ["article"],
      user: ["article"],
    });
  });

  it("deduplicates a repeated source", () => {
    const data: GraphData = {
      ...FIXTURE,
      edges: [edge("a", "b"), edge("a", "b"), edge("c", "b")],
    };
    expect(buildBacklinks(data).b).toEqual(["a", "c"]);
  });

  it("leaves a node nobody links to absent", () => {
    expect(buildBacklinks(FIXTURE).island).toBeUndefined();
  });
});

describe("listKindKeys", () => {
  it("returns one key per kind present, memory split by type, sorted", () => {
    const data: GraphData = {
      ...FIXTURE,
      nodes: [
        ...FIXTURE.nodes,
        node({ id: "tech", kind: "memory", memoryType: "tech", href: "/m/t" }),
        node({ id: "inbox", kind: "inbox", href: "/d/inbox" }),
      ],
    };
    expect(listKindKeys(data)).toEqual([
      "article",
      "inbox",
      "memory:tech",
      "memory:user",
      "tag",
    ]);
  });

  it("is empty for missing data", () => {
    expect(listKindKeys(null)).toEqual([]);
  });
});

describe("visibleSubset", () => {
  const degree = buildDegree(FIXTURE);

  it("keeps everything when nothing is hidden", () => {
    const out = visibleSubset(FIXTURE, new Set(), false, degree);
    expect(out.nodes).toHaveLength(FIXTURE.nodes.length);
    expect(out.edges).toEqual(FIXTURE.edges);
  });

  it("drops a hidden kind key, and only that key", () => {
    // Hiding `memory:user` must not hide other memory types — that is the whole
    // point of keying memory nodes by type.
    const data: GraphData = {
      ...FIXTURE,
      nodes: [
        ...FIXTURE.nodes,
        node({ id: "tech", kind: "memory", memoryType: "tech", href: "/m/t" }),
      ],
    };
    const out = visibleSubset(
      data,
      new Set(["memory:user"]),
      false,
      buildDegree(data)
    );
    expect(out.nodes.map((n) => n.id)).not.toContain("user");
    expect(out.nodes.map((n) => n.id)).toContain("tech");
  });

  it("orphans-only keeps the degree-0 node and drops every edge", () => {
    const out = visibleSubset(FIXTURE, new Set(), true, degree);
    expect(out.nodes.map((n) => n.id)).toEqual(["island"]);
    expect(out.edges).toEqual([]);
  });

  it("is empty for missing data", () => {
    expect(visibleSubset(null, new Set(), false, {})).toEqual({
      nodes: [],
      edges: [],
    });
  });
});

describe("rawMdUrl", () => {
  it("points at the generated markdown next to the page", () => {
    expect(rawMdUrl(node({ id: "a" }))).toBe("/k/a.md");
    expect(rawMdUrl(node({ id: "u", kind: "memory", href: "/m/u" }))).toBe(
      "/m/u.md"
    );
  });

  it("has none for a tag, which has no page of its own", () => {
    expect(rawMdUrl(node({ id: "#t", kind: "tag", href: "" }))).toBeNull();
  });
});
