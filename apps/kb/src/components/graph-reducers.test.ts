import Graph from "graphology";
import { describe, expect, it } from "vitest";
import {
  createReducers,
  createVisualCtx,
  type ReducerGraph,
  syncVisualCtx,
  type VisualSources,
} from "./graph-reducers";
import { THEME } from "./graph-theme";

/**
 * hub ————— leaf        (a "tag" leaf, so kind filters can hide one endpoint)
 *   ╲
 *    edge ————— far
 * island                   (degree 0, so orphans-only keeps it)
 */
const NODES = [
  { id: "hub", kind: "article", revealOrder: 0, size: 10 },
  { id: "leaf", kind: "tag", revealOrder: 1, size: 8 },
  { id: "far", kind: "article", revealOrder: 1, size: 8 },
  { id: "island", kind: "inbox", revealOrder: 1, size: 8 },
];
const EDGES = [
  ["hub->leaf", "hub", "leaf"],
  ["hub->far", "hub", "far"],
] as const;

function makeGraph(): ReducerGraph {
  const graph = new Graph({ multi: false, type: "directed" });
  for (const n of NODES) {
    graph.addNode(n.id, {
      x: 0,
      y: 0,
      nodeKind: n.kind,
      revealOrder: n.revealOrder,
    });
  }
  for (const [key, source, target] of EDGES)
    graph.addEdgeWithKey(key, source, target);
  return graph;
}

/** The attributes Sigma hands a reducer for one node. */
function attrs(size: number, revealOrder: number) {
  return {
    label: "x",
    size,
    color: "#fff",
    hidden: false,
    forceLabel: false,
    zIndex: 1,
    revealOrder,
  };
}

const BASE_SOURCES: VisualSources = {
  hidden: new Set<string>(),
  onlyOrphans: false,
  theme: THEME.dark,
  hits: new Set<string>(),
  hover: null,
  selected: null,
};

function harness(reveal = 1) {
  const graph = makeGraph();
  const ctx = createVisualCtx({
    hidden: BASE_SOURCES.hidden,
    theme: BASE_SOURCES.theme,
    hits: BASE_SOURCES.hits,
  });
  const revealRef = { current: reveal };
  const reducers = createReducers(graph, ctx, revealRef);
  const apply = (sources: Partial<VisualSources> = {}) => {
    syncVisualCtx(graph, ctx, { ...BASE_SOURCES, ...sources });
    return reducers;
  };
  return { graph, ctx, reducers, revealRef, apply };
}

describe("syncVisualCtx", () => {
  it("rewrites the snapshot in place, so bound reducers keep seeing it", () => {
    const { ctx, reducers, apply } = harness();
    const before = ctx;
    apply({ selected: "hub" });
    expect(ctx).toBe(before);
    expect(ctx.sel).toBe("hub");
    expect(reducers.nodeReducer("hub", attrs(10, 0)).forceLabel).toBe(true);
  });

  it("emphasizes the hovered node's neighborhood, falling back to the selection", () => {
    const { ctx, apply } = harness();
    apply({ hover: "hub" });
    expect(ctx.focus).toBe("hub");
    expect([...ctx.neighbors].sort()).toEqual(["far", "hub", "leaf"]);
    apply({ hover: null, selected: "far" });
    expect(ctx.focus).toBe("far");
    expect([...ctx.neighbors].sort()).toEqual(["far", "hub"]);
  });

  it("ignores a focus that is not in the graph", () => {
    const { ctx, apply } = harness();
    apply({ selected: "nope" });
    expect(ctx.focus).toBe("nope");
    expect(ctx.neighbors.size).toBe(0);
  });

  it("derives `searching` from whether there are hits", () => {
    const { ctx, apply } = harness();
    apply({ hits: new Set(["hub"]) });
    expect(ctx.searching).toBe(true);
    apply({ hits: new Set() });
    expect(ctx.searching).toBe(false);
  });
});

describe("nodeReducer", () => {
  it("passes untouched nodes through, explicitly unhidden", () => {
    const { apply } = harness();
    const { nodeReducer } = apply();
    const res = nodeReducer("hub", attrs(10, 0));
    expect(res.hidden).toBe(false);
    expect(res.size).toBe(10);
    expect(res.zIndex).toBe(1);
  });

  it("hides a node whose kind key the user switched off", () => {
    const { apply } = harness();
    const { nodeReducer } = apply({ hidden: new Set(["tag"]) });
    expect(nodeReducer("leaf", attrs(8, 1)).hidden).toBe(true);
    expect(nodeReducer("hub", attrs(10, 0)).hidden).toBe(false);
  });

  it("keeps only the degree-0 nodes under orphans-only", () => {
    const { apply } = harness();
    const { nodeReducer } = apply({ onlyOrphans: true });
    expect(nodeReducer("island", attrs(8, 1)).hidden).toBe(false);
    expect(nodeReducer("hub", attrs(10, 0)).hidden).toBe(true);
  });

  it("staggers the reveal: a node appears once the front passes its rank", () => {
    // rank 0: t = reveal / 0.3 · rank 1: t = (reveal - 0.7) / 0.3
    const early = harness(0);
    early.apply();
    expect(early.reducers.nodeReducer("leaf", attrs(8, 1)).hidden).toBe(true);
    expect(early.reducers.nodeReducer("hub", attrs(10, 0)).hidden).toBe(true);

    const mid = harness(0.5);
    mid.apply();
    expect(mid.reducers.nodeReducer("hub", attrs(10, 0)).hidden).toBe(false);
    expect(mid.reducers.nodeReducer("leaf", attrs(8, 1)).hidden).toBe(true);

    const late = harness(0.85);
    late.apply();
    const partial = late.reducers.nodeReducer("leaf", attrs(8, 1));
    expect(partial.hidden).toBe(false);
    expect(partial.label).toBe("");
    expect(partial.size as number).toBeCloseTo(8 * ((0.85 - 0.7) / 0.3));
  });

  it("lifts search hits and dims the rest", () => {
    const { apply } = harness();
    const { nodeReducer } = apply({ hits: new Set(["hub"]) });
    const hit = nodeReducer("hub", attrs(10, 0));
    expect(hit.forceLabel).toBe(true);
    expect(hit.zIndex).toBe(2);
    expect(hit.size as number).toBeCloseTo(10 * 1.2);
    const miss = nodeReducer("far", attrs(8, 1));
    expect(miss.color).toBe(THEME.dark.dim);
    expect(miss.label).toBe("");
    expect(miss.zIndex).toBe(0);
  });

  it("search wins over hover when both are set", () => {
    const { apply } = harness();
    const { nodeReducer } = apply({ hits: new Set(["hub"]), hover: "far" });
    // "far" is the focus but not a hit, so it is dimmed like any other miss;
    // "hub" is the only hit, and it is not the focus, so it gets the 1.2 bump.
    expect(nodeReducer("far", attrs(8, 1)).color).toBe(THEME.dark.dim);
    expect(nodeReducer("hub", attrs(10, 0)).size as number).toBeCloseTo(
      10 * 1.2
    );
  });

  it("gives a hit that is also the focus the larger bump", () => {
    const { apply } = harness();
    const { nodeReducer } = apply({ hits: new Set(["far"]), hover: "far" });
    expect(nodeReducer("far", attrs(8, 1)).size as number).toBeCloseTo(8 * 1.4);
  });

  it("highlights the focused neighborhood and dims everything else", () => {
    const { apply } = harness();
    const { nodeReducer } = apply({ hover: "hub" });
    expect(nodeReducer("far", attrs(8, 1)).hidden).toBe(false);
    expect(nodeReducer("far", attrs(8, 1)).color).toBe("#fff"); // untouched
    expect(nodeReducer("hub", attrs(10, 0)).size as number).toBeCloseTo(
      10 * 1.35
    );
    const miss = nodeReducer("island", attrs(8, 1));
    expect(miss.color).toBe(THEME.dark.dim);
    expect(miss.zIndex).toBe(0);
  });

  it("lifts the selected node and its neighbors when nothing is hovered", () => {
    const { apply } = harness();
    const { nodeReducer } = apply({ selected: "hub" });
    // Selection shares the focus path with hover, so it enlarges the focus and
    // keeps its neighbors lit rather than emphasizing the selection alone.
    const res = nodeReducer("hub", attrs(10, 0));
    expect(res.forceLabel).toBe(true);
    expect(res.zIndex).toBe(2);
    expect(res.size as number).toBeCloseTo(10 * 1.35);
    expect(nodeReducer("far", attrs(8, 1)).size).toBe(8);
    expect(nodeReducer("island", attrs(8, 1)).color).toBe(THEME.dark.dim);
  });
});

describe("edgeReducer", () => {
  const edgeAttrs = { size: 0.7, color: "#000", hidden: false, zIndex: 0 };

  it("passes an un-emphasized edge through in the theme color", () => {
    const { apply } = harness();
    const { edgeReducer } = apply();
    expect(edgeReducer("hub->far", edgeAttrs)).toEqual({
      ...edgeAttrs,
      color: THEME.dark.edge,
    });
  });

  it("hides an edge when either endpoint's kind is hidden", () => {
    const { apply } = harness();
    const { edgeReducer } = apply({ hidden: new Set(["tag"]) });
    expect(edgeReducer("hub->leaf", edgeAttrs).hidden).toBe(true);
    expect(edgeReducer("hub->far", edgeAttrs).hidden).toBe(false);
  });

  it("hides every edge under orphans-only — both endpoints are dropped", () => {
    const { apply } = harness();
    const { edgeReducer } = apply({ onlyOrphans: true });
    expect(edgeReducer("hub->far", edgeAttrs).hidden).toBe(true);
  });

  it("waits for both endpoints to be revealed", () => {
    // threshold = max(revealOrder) * 0.7 + 0.2, so an edge to a rank-1 node
    // only appears at 0.9 of the reveal front.
    const early = harness(0.1);
    early.apply();
    expect(early.reducers.edgeReducer("hub->leaf", edgeAttrs).hidden).toBe(
      true
    );
    expect(early.reducers.edgeReducer("hub->far", edgeAttrs).hidden).toBe(true);

    const mid = harness(0.5);
    mid.apply();
    expect(mid.reducers.edgeReducer("hub->far", edgeAttrs).hidden).toBe(true);
    // the node itself is already visible by then, the edge is not
    expect(mid.reducers.nodeReducer("hub", attrs(10, 0)).hidden).toBe(false);

    const late = harness(0.95);
    late.apply();
    expect(late.reducers.edgeReducer("hub->far", edgeAttrs).hidden).toBe(false);
    expect(late.reducers.edgeReducer("hub->leaf", edgeAttrs).hidden).toBe(
      false
    );
  });

  it("emphasizes the focused neighborhood and dims the rest", () => {
    const { apply } = harness();
    const { edgeReducer } = apply({ hover: "hub" });
    expect(edgeReducer("hub->far", edgeAttrs)).toEqual({
      ...edgeAttrs,
      color: THEME.dark.edgeHover,
      size: 1.2,
      zIndex: 1,
    });
  });

  it("emphasizes by search hits, and only when both ends are hits", () => {
    const { apply } = harness();
    const both = apply({ hits: new Set(["hub", "far"]) });
    expect(both.edgeReducer("hub->far", edgeAttrs).color).toBe(
      THEME.dark.edgeHover
    );
    const one = apply({ hits: new Set(["hub"]) });
    expect(one.edgeReducer("hub->far", edgeAttrs).color).toBe(THEME.dark.dim);
    expect(one.edgeReducer("hub->far", edgeAttrs).zIndex).toBe(0);
  });
});
