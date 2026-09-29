import Graph from "graphology";
import { describe, expect, it } from "vitest";
import type { GraphData } from "../../lib/graph-types";
import {
  buildSigmaGraph,
  DEFAULT_FORCES,
  type ForceSettings,
  fa2Settings,
} from "./graph-build";
import { buildDegree } from "./graph-derive";
import { THEME } from "./graph-theme";

function node(over: Partial<GraphData["nodes"][number]> & { id: string }) {
  return {
    label: over.id,
    kind: "article" as const,
    href: `/k/${over.id}`,
    tags: [],
    description: "",
    updated: "",
    ...over,
  };
}

/**
 * a—b—c with `c` a tag node, plus two records the graph must absorb: a
 * duplicate `a→b` edge and an edge from a node that isn't in the payload.
 */
const DATA: GraphData = {
  generated: "2026-01-01T00:00:00.000Z",
  nodes: [
    node({ id: "a" }),
    node({ id: "b" }),
    node({ id: "c", kind: "tag", href: "" }),
    node({ id: "loose" }),
  ],
  edges: [
    { source: "a", target: "b", kind: "link" },
    { source: "a", target: "b", kind: "tag" },
    { source: "b", target: "c", kind: "tag" },
    { source: "gone", target: "a", kind: "link" },
  ],
};

// The viewer passes the degrees of the *payload*, before dedup.
const DEGREE = buildDegree(DATA);

function build() {
  return buildSigmaGraph(Graph, DATA, DEGREE, THEME.dark);
}

describe("buildSigmaGraph", () => {
  it("adds every node and only the edges whose endpoints both exist", () => {
    const graph = build();
    expect(graph.order).toBe(4);
    // a→b collapses to one edge; the edge from `gone` is dropped.
    expect(graph.size).toBe(2);
    expect(graph.hasEdge("a", "b")).toBe(true);
    expect(graph.hasEdge("b", "c")).toBe(true);
  });

  it("sizes a node by its degree, tags smaller than content nodes", () => {
    const graph = build();
    const a = graph.getNodeAttribute("a", "size") as number;
    const loose = graph.getNodeAttribute("loose", "size") as number;
    const tag = graph.getNodeAttribute("c", "size") as number;
    // base + sqrt(degree) * 1.8, with 3.5 for tags and 4.5 otherwise
    expect(loose).toBeCloseTo(4.5);
    expect(a).toBeCloseTo(4.5 + Math.sqrt(3) * 1.8);
    expect(tag).toBeCloseTo(3.5 + Math.sqrt(1) * 1.8);
  });

  it("tags each node with the kind key the filters and reducers index on", () => {
    const graph = build();
    expect(graph.getNodeAttribute("a", "nodeKind")).toBe("article");
    expect(graph.getNodeAttribute("c", "nodeKind")).toBe("tag");
  });

  it("reveals hubs first: the highest-degree node has revealOrder 0", () => {
    const graph = build();
    expect(graph.getNodeAttribute("a", "revealOrder")).toBe(0);
    expect(graph.getNodeAttribute("loose", "revealOrder")).toBe(1);
  });

  it("paints from the theme and gives tag edges a thinner line", () => {
    const graph = build();
    expect(graph.getNodeAttribute("a", "color")).toBe(THEME.dark.article);
    expect(graph.getNodeAttribute("c", "color")).toBe(THEME.dark.tag);
    // a→b keeps the kind of the first record it saw ("link"), b→c is a tag edge.
    expect(graph.getEdgeAttribute("a", "b", "size")).toBe(0.7);
    expect(graph.getEdgeAttribute("b", "c", "size")).toBe(0.5);
    expect(graph.getEdgeAttribute("b", "c", "color")).toBe(THEME.dark.edge);
  });
});

describe("fa2Settings", () => {
  const forces: ForceSettings = {
    ...DEFAULT_FORCES,
    gravity: 2,
    scalingRatio: 9,
  };
  const small = { order: 10 };

  it("is the same physics for the settle pass and the live worker", () => {
    const settle = fa2Settings(small, forces, 1);
    const live = fa2Settings(small, forces, 25);
    expect({ ...settle, slowDown: 0 }).toEqual({ ...live, slowDown: 0 });
    expect(settle).toMatchObject({
      gravity: 2,
      scalingRatio: 9,
      edgeWeightInfluence: forces.edgeWeightInfluence,
      strongGravityMode: true,
      adjustSizes: true,
      linLogMode: false,
      barnesHutOptimize: false,
    });
  });

  it("only differs in damping, and Barnes-Hut kicks in above 80 nodes", () => {
    expect(fa2Settings({ order: 80 }, forces, 1).barnesHutOptimize).toBe(false);
    expect(fa2Settings({ order: 81 }, forces, 1).barnesHutOptimize).toBe(true);
    expect(fa2Settings({ order: 81 }, forces, 1).slowDown).toBe(1);
    expect(fa2Settings({ order: 81 }, forces, 25).slowDown).toBe(25);
  });
});
