/**
 * The 2D visual reducers: how one node and one edge are drawn, given the
 * current filters, search, hover and reveal progress.
 *
 * They used to live inside the Sigma mount effect, which made the most
 * behaviour-heavy logic in the viewer unreachable from a test. The split is safe
 * because `visualCtx` is a *mutable* snapshot: the reducers only ever read it,
 * and `syncVisualCtx` rewrites its fields in place, so the same object identity
 * survives every refresh. Pass it in and the reducers stay pure.
 *
 * Assigned to Sigma exactly once per mount — re-binding a reducer makes Sigma
 * reindex the whole graph.
 */

import type { GraphTheme } from "./graph-theme";

/** A node/edge attribute bag, as Sigma hands it to a reducer. */
export type AttrMap = Record<string, unknown>;

/** The slice of a graphology graph the visual layer reads. */
export interface ReducerGraph {
  hasNode(node: string): boolean;
  forEachNeighbor(node: string, cb: (neighbor: string) => void): void;
  getNodeAttribute(node: string, attr: string): unknown;
  degree(node: string): number;
  extremities(edge: string): [string, string];
}

/** Everything the reducers read, snapshotted at refresh time. */
export interface VisualCtx {
  hidden: Set<string>;
  onlyOrphans: boolean;
  theme: GraphTheme;
  hits: Set<string>;
  searching: boolean;
  neighbors: Set<string>;
  focus: string | null;
  sel: string | null;
}

/** Current values of the viewer state the snapshot is derived from. */
export interface VisualSources {
  hidden: Set<string>;
  onlyOrphans: boolean;
  theme: GraphTheme;
  hits: Set<string>;
  hover: string | null;
  selected: string | null;
}

export function createVisualCtx(initial: {
  hidden: Set<string>;
  theme: GraphTheme;
  hits: Set<string>;
}): VisualCtx {
  return {
    hidden: initial.hidden,
    onlyOrphans: false,
    theme: initial.theme,
    hits: initial.hits,
    searching: false,
    neighbors: new Set<string>(),
    focus: null,
    sel: null,
  };
}

/**
 * Refresh the snapshot in place from live viewer state.
 *
 * The focus is the hovered node, falling back to the selected one, and the
 * emphasized set is the focus node plus its neighbors — so hover and selection
 * share one code path.
 */
export function syncVisualCtx(
  graph: ReducerGraph,
  ctx: VisualCtx,
  sources: VisualSources
): void {
  const { hidden, onlyOrphans, theme, hits, hover, selected } = sources;
  const neighbors = new Set<string>();
  const focus = hover ?? selected;
  if (focus && graph.hasNode(focus)) {
    neighbors.add(focus);
    graph.forEachNeighbor(focus, (nb) => neighbors.add(nb));
  }
  ctx.hidden = hidden;
  ctx.onlyOrphans = onlyOrphans;
  ctx.theme = theme;
  ctx.hits = hits;
  ctx.searching = hits.size > 0;
  ctx.neighbors = neighbors;
  ctx.focus = focus;
  ctx.sel = selected;
}

/**
 * Build the node and edge reducers for one mount. `reveal` is the 0..1 staged
 * reveal front, held in a ref because it advances every animation frame.
 */
export function createReducers(
  graph: ReducerGraph,
  visualCtx: VisualCtx,
  reveal: { current: number }
): {
  nodeReducer: (node: string, attrs: AttrMap) => AttrMap;
  edgeReducer: (edge: string, attrs: AttrMap) => AttrMap;
} {
  return {
    nodeReducer: (node, attrs) => {
      const res: AttrMap = { ...attrs };
      const {
        hidden,
        onlyOrphans,
        theme,
        hits,
        searching,
        neighbors,
        focus,
        sel,
      } = visualCtx;
      const nodeKind = graph.getNodeAttribute(node, "nodeKind") as string;
      if (hidden.has(nodeKind)) {
        res.hidden = true;
        return res;
      }
      const revealFront = reveal.current;
      if (revealFront < 1) {
        // Each node fades/scales in once the reveal front passes its rank.
        const rank = (attrs.revealOrder as number) ?? 0;
        const t = (revealFront - rank * 0.7) / 0.3;
        if (t <= 0) {
          res.hidden = true;
          return res;
        }
        if (t < 1) {
          res.size = (attrs.size as number) * t;
          res.label = "";
        }
      }
      if (onlyOrphans && graph.degree(node) > 0) {
        res.hidden = true;
        return res;
      }
      res.hidden = false;
      if (searching) {
        if (hits.has(node)) {
          res.zIndex = 2;
          res.forceLabel = true;
          res.size = (attrs.size as number) * (node === focus ? 1.4 : 1.2);
        } else {
          res.color = theme.dim;
          res.label = "";
          res.zIndex = 0;
        }
      } else if (focus && neighbors.size) {
        if (neighbors.has(node)) {
          res.zIndex = 2;
          res.forceLabel = true;
          if (node === focus) res.size = (attrs.size as number) * 1.35;
        } else {
          res.color = theme.dim;
          res.label = "";
          res.zIndex = 0;
        }
      } else if (sel && node === sel) {
        // Belt and braces: `sel` also sets `focus`, and a focus is always added
        // to `neighbors`, so in practice the branch above handles selection too.
        res.forceLabel = true;
        res.size = (attrs.size as number) * 1.25;
        res.zIndex = 2;
      }
      return res;
    },
    edgeReducer: (edge, attrs) => {
      const res: AttrMap = { ...attrs };
      const { hidden, onlyOrphans, theme, hits, searching, neighbors, focus } =
        visualCtx;
      const [a, b] = graph.extremities(edge);
      const aKind = graph.getNodeAttribute(a, "nodeKind") as string;
      const bKind = graph.getNodeAttribute(b, "nodeKind") as string;
      if (hidden.has(aKind) || hidden.has(bKind)) {
        res.hidden = true;
        return res;
      }
      const revealFront = reveal.current;
      if (revealFront < 1) {
        // An edge appears only once both endpoints are mostly revealed.
        const ra = (graph.getNodeAttribute(a, "revealOrder") as number) ?? 0;
        const rb = (graph.getNodeAttribute(b, "revealOrder") as number) ?? 0;
        if (revealFront < Math.max(ra, rb) * 0.7 + 0.2) {
          res.hidden = true;
          return res;
        }
      }
      if (onlyOrphans) {
        res.hidden = true;
        return res;
      }
      // Search hits and the hovered/selected neighborhood dim and highlight
      // edges identically — only the membership set differs, so pick the set
      // once and share the branch.
      const emphasis = searching
        ? hits
        : focus && neighbors.size
          ? neighbors
          : null;
      if (emphasis) {
        if (emphasis.has(a) && emphasis.has(b)) {
          res.color = theme.edgeHover;
          res.size = 1.2;
          res.zIndex = 1;
        } else {
          res.color = theme.dim;
          res.zIndex = 0;
        }
      } else {
        res.color = theme.edge;
      }
      return res;
    },
  };
}
