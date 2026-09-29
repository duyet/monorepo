/**
 * Construction of the Sigma/graphology graph for the homepage viewer.
 *
 * Lives outside `GraphViewer` so the seeding math (where each node starts, how
 * big it is, what color) is a plain function instead of 70 lines inside the
 * mount effect — and so it can be tested against a stub graph without booting
 * WebGL. `graphology` is still imported by the *caller* and passed in: it stays
 * out of the SSR/prerender bundle exactly as before.
 */

import type { GraphData, GraphNode } from "../../lib/graph-types";
import { nodeKindKey } from "./graph-kinds";
import { type GraphTheme, nodeColor } from "./graph-theme";

type GraphologyGraph = import("graphology").default;
type GraphologyCtor = typeof import("graphology").default;

export interface ForceSettings {
  gravity: number; // center force
  scalingRatio: number; // repel force
  edgeWeightInfluence: number; // link force
  linkDistance: number; // uniform edge weight (higher = looser)
}

export const DEFAULT_FORCES: ForceSettings = {
  gravity: 1,
  scalingRatio: 10,
  edgeWeightInfluence: 1,
  linkDistance: 1,
};

/**
 * ForceAtlas2 settings, shared by the pre-settle pass and the live worker.
 *
 * Both need the same physics; only the damping differs — the settle pass runs
 * many iterations fast (`slowDown: 1`), the live worker barely runs at all
 * (`slowDown: 25`) because it only reheats on a drag or a slider change.
 */
export function fa2Settings(
  graph: { order: number },
  forces: ForceSettings,
  slowDown: number
) {
  return {
    gravity: forces.gravity,
    scalingRatio: forces.scalingRatio,
    edgeWeightInfluence: forces.edgeWeightInfluence,
    strongGravityMode: true,
    barnesHutOptimize: graph.order > 80,
    adjustSizes: true,
    slowDown,
    linLogMode: false,
  };
}

/**
 * `revealOrder` per node: 0 for the highest-degree node, 1 for the lowest.
 * The 2D reducers use it to fade hubs in before leaves, so the graph reads as
 * a hierarchy rather than a random scatter.
 */
function revealRanks(
  nodes: GraphNode[],
  degree: Record<string, number>
): Map<string, number> {
  const byDegree = [...nodes].sort(
    (a, b) => (degree[b.id] ?? 0) - (degree[a.id] ?? 0)
  );
  return new Map(
    byDegree.map((node, i) => [node.id, i / Math.max(byDegree.length - 1, 1)])
  );
}

/**
 * Build the graphology graph: seed every node on a small circle (the layout
 * immediately replaces those coordinates) with a degree-scaled size, and add
 * every edge whose endpoints both exist, skipping duplicates.
 */
export function buildSigmaGraph(
  Graph: GraphologyCtor,
  data: GraphData,
  degree: Record<string, number>,
  theme: GraphTheme
): GraphologyGraph {
  const graph = new Graph({
    multi: false,
    type: "directed",
    allowSelfLoops: false,
  }) as GraphologyGraph;
  const n = Math.max(data.nodes.length, 1);
  const revealRank = revealRanks(data.nodes, degree);

  data.nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / n;
    const radius = 40 + (i % 7) * 3;
    const deg = degree[node.id] ?? 0;
    const base = node.kind === "tag" ? 3.5 : 4.5;
    graph.addNode(node.id, {
      label: node.label,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: base + Math.sqrt(deg) * 1.8,
      color: nodeColor(node.kind, node.memoryType, theme),
      type: "circle",
      nodeKind: nodeKindKey(node),
      forceLabel: false,
      zIndex: 1,
      revealOrder: revealRank.get(node.id) ?? 0,
    });
  });

  for (const e of data.edges) {
    if (!graph.hasNode(e.source) || !graph.hasNode(e.target)) continue;
    if (graph.hasEdge(e.source, e.target)) continue;
    graph.addEdgeWithKey(`${e.source}->${e.target}`, e.source, e.target, {
      size: e.kind === "tag" ? 0.5 : 0.7,
      color: theme.edge,
      type: "arrow",
      weight: 1,
      zIndex: 0,
    });
  }

  return graph;
}
