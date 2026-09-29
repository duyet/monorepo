/**
 * Pure derivations over the fetched `graph-data.json` payload.
 *
 * These used to be `useMemo` bodies inside `GraphViewer`, which made them
 * untestable (they were reachable only through React state) and unreadable
 * (four index builders in a row between the refs and the mount effect). They
 * are plain functions of the payload here so they can be called from a memo, a
 * test, or anywhere else, and so the component only owns the wiring.
 */

import type { GraphData, GraphEdge, GraphNode } from "../../lib/graph-types";
import { nodeKindKey } from "./graph-kinds";

/** `id → node`. Last node with a duplicate id wins, as before. */
export function buildNodeMap(
  data: GraphData | null | undefined
): Record<string, GraphNode> {
  const map: Record<string, GraphNode> = {};
  for (const n of data?.nodes ?? []) map[n.id] = n;
  return map;
}

/** Incidence count per node: every edge counts once for each of its endpoints. */
export function buildDegree(
  data: GraphData | null | undefined
): Record<string, number> {
  const deg: Record<string, number> = {};
  for (const e of data?.edges ?? []) {
    deg[e.source] = (deg[e.source] ?? 0) + 1;
    deg[e.target] = (deg[e.target] ?? 0) + 1;
  }
  return deg;
}

/** `target → distinct sources`, i.e. what a node is linked from. */
export function buildBacklinks(
  data: GraphData | null | undefined
): Record<string, string[]> {
  const bl: Record<string, string[]> = {};
  for (const e of data?.edges ?? []) {
    if (!bl[e.target]) bl[e.target] = [];
    if (!bl[e.target].includes(e.source)) bl[e.target].push(e.source);
  }
  return bl;
}

/** Every kind key present in the payload, sorted — one chip per key. */
export function listKindKeys(data: GraphData | null | undefined): string[] {
  const set = new Set<string>();
  for (const n of data?.nodes ?? []) set.add(nodeKindKey(n));
  return [...set].sort();
}

/**
 * The subset the 3D view is allowed to draw, applying the same two filters the
 * 2D reducers apply: hidden kind keys, and (when on) orphans only — which also
 * drops every edge, since an edge needs both endpoints.
 */
export function visibleSubset(
  data: GraphData | null | undefined,
  hiddenKinds: Set<string>,
  orphansOnly: boolean,
  degree: Record<string, number>
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (!data) return { nodes: [], edges: [] };
  const nodes = data.nodes.filter((n) => {
    if (hiddenKinds.has(nodeKindKey(n))) return false;
    if (orphansOnly && (degree[n.id] ?? 0) > 0) return false;
    return true;
  });
  return { nodes, edges: orphansOnly ? [] : data.edges };
}

/**
 * URL of a node's raw markdown, or `null` when it has none. Tag nodes are the
 * only kind without a page of their own.
 */
export function rawMdUrl(node: GraphNode): string | null {
  if (node.kind === "tag") return null;
  return `${node.href}.md`;
}
