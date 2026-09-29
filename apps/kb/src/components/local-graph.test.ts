import { describe, expect, it } from "vitest";
import type { GraphEdge, GraphNode } from "../../lib/graph-types";
import { extractLocalGraph } from "./LocalGraph";

function node(id: string): GraphNode {
  return {
    id,
    label: id,
    kind: "article",
    href: `/k/${id}`,
    tags: [],
    description: "",
    updated: "",
  };
}

function edge(source: string, target: string): GraphEdge {
  return { source, target, kind: "link" };
}

/** Chain a—b—c—d—e, plus an isolated island f. */
function chainFixture() {
  return {
    nodes: ["a", "b", "c", "d", "e", "f"].map(node),
    edges: [
      edge("a", "b"),
      edge("b", "c"),
      edge("c", "d"),
      edge("d", "e"),
    ],
  };
}

const ids = (nodes: GraphNode[]) => nodes.map((n) => n.id);

describe("extractLocalGraph", () => {
  it("includes the current note and its direct neighbors at depth 1", () => {
    const { nodes, edges } = extractLocalGraph(chainFixture(), "c", 1);
    expect(ids(nodes).sort()).toEqual(["b", "c", "d"]);
    expect(edges).toHaveLength(2);
  });

  it("extends to depth 2 when allowed", () => {
    const { nodes } = extractLocalGraph(chainFixture(), "c", 2);
    expect(ids(nodes).sort()).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("defaults to depth 2", () => {
    expect(extractLocalGraph(chainFixture(), "c")).toEqual(
      extractLocalGraph(chainFixture(), "c", 2)
    );
  });

  it("traverses edges in both directions", () => {
    // `a` only has an outgoing edge, but is still a neighbor of `b`.
    const { nodes } = extractLocalGraph(chainFixture(), "b", 1);
    expect(ids(nodes).sort()).toEqual(["a", "b", "c"]);
  });

  it("returns just the current note when it has no edges", () => {
    const { nodes, edges } = extractLocalGraph(chainFixture(), "f", 2);
    expect(ids(nodes)).toEqual(["f"]);
    expect(edges).toEqual([]);
  });

  it("returns nothing for an unknown id", () => {
    const { nodes, edges } = extractLocalGraph(chainFixture(), "missing", 2);
    expect(nodes).toEqual([]);
    expect(edges).toEqual([]);
  });

  it("drops edges whose endpoints are outside the included set", () => {
    const { edges } = extractLocalGraph(chainFixture(), "c", 1);
    // b—c and c—d are inside; a—b and c—d's other side is not.
    for (const e of edges) {
      expect(["b", "c", "d"]).toContain(e.source);
      expect(["b", "c", "d"]).toContain(e.target);
    }
  });
});
