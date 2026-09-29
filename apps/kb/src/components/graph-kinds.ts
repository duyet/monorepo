/**
 * The graph's kind-key vocabulary, shared by everything that filters or labels
 * nodes.
 *
 * A "kind key" is what the UI filters on. It is the bare `NodeKind` for
 * everything except memory nodes, which are keyed by their memory type so each
 * type is separately filterable: `memory:user`, `memory:tech`, … Writing it in
 * one place is the point — the Sigma `nodeKind` attribute, the filter chips, the
 * swatch resolver (`graph-theme.kindSwatch`) and the 3D subset filter all have
 * to agree, or a chip hides nothing or the highlight misses.
 */

import type { GraphNode, NodeKind } from "../../lib/graph-types";

export type { NodeKind };

/** Prefix that marks a filter key as "one memory type of `memory`". */
export const MEMORY_KEY_PREFIX = "memory:";

export const KIND_LABEL: Record<NodeKind, string> = {
  article: "Article",
  memory: "Memory",
  inbox: "Daily",
  tag: "Tag",
};

/** Strip the `memory:<type>` suffix a filter key carries, back to its base kind. */
export function baseKind(key: string): NodeKind {
  return (key.startsWith(MEMORY_KEY_PREFIX) ? "memory" : key) as NodeKind;
}

/** The memory type a filter key names, or `undefined` for a bare kind key. */
export function memoryTypeOfKey(key: string): string | undefined {
  return key.startsWith(MEMORY_KEY_PREFIX)
    ? key.slice(MEMORY_KEY_PREFIX.length)
    : undefined;
}

/**
 * The `nodeKind` index key for a node: memory nodes are keyed by their memory
 * type so each type is separately filterable, everything else by bare kind.
 *
 * Written as the Sigma `nodeKind` node attribute, and recomputed on the JS side
 * to match against the user's hidden-kind set. The 2D reducer reads the Sigma
 * attribute, the 3D filter and the kind chips read this function — all four must
 * agree, so it is defined once.
 */
export function nodeKindKey(node: GraphNode): string {
  return node.kind === "memory"
    ? `${MEMORY_KEY_PREFIX}${node.memoryType ?? "other"}`
    : node.kind;
}
