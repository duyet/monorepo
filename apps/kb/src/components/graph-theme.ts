/**
 * Graph color theme, shared by every graph surface.
 *
 * Three components draw the same four node kinds (GraphViewer 2D, Graph3D 3D,
 * LocalGraph sidebar) and each had its own copy of the same `nodeColor` branch
 * chain. They drifted: LocalGraph hardcoded its own neutral colors instead of
 * reading them from a theme. One resolver, one source of truth.
 *
 * The per-kind neutral colors are deliberately NOT themed in light mode: an
 * article node is the same grey in both, and only the graph chrome (bg, edges,
 * dimmed state, labels) flips.
 */

import { memoryTypeOfKey } from "./graph-kinds";
import { MEMORY_PALETTE } from "./graph-palette";

/** The subset of theme colors `nodeColor` needs. */
export interface NodeColors {
  /** Neutral used for article nodes and as the memory-palette fallback. */
  article: string;
  inbox: string;
  tag: string;
}

export interface GraphTheme extends NodeColors {
  bg: string;
  edge: string;
  edgeHover: string;
  dim: string;
  label: string;
}

export const THEME: { light: GraphTheme; dark: GraphTheme } = {
  light: {
    bg: "#fafafa",
    edge: "#d4d4d8",
    edgeHover: "#71717a",
    dim: "#e4e4e7",
    label: "#3f3f46",
    article: "#6b7280",
    inbox: "#3b82f6",
    tag: "#22c55e",
  },
  dark: {
    bg: "#0a0a0a",
    edge: "#3f3f46",
    edgeHover: "#a1a1aa",
    dim: "#1c1c1f",
    label: "#a1a1aa",
    article: "#9ca3af",
    inbox: "#3b82f6",
    tag: "#22c55e",
  },
};

/**
 * Resolve a node's fill color.
 *
 * `memory` nodes look up `MEMORY_PALETTE` by `memoryType` and fall back to the
 * neutral article color for an unknown/missing type — the same fallback the
 * three previous copies used.
 */
export function nodeColor(
  kind: string,
  memoryType: string | undefined,
  colors: NodeColors
): string {
  if (kind === "memory") return MEMORY_PALETTE[memoryType ?? ""] ?? colors.article;
  if (kind === "inbox") return colors.inbox;
  if (kind === "tag") return colors.tag;
  return colors.article;
}

/**
 * Resolve the swatch color for a filter *kind key*.
 *
 * Filter keys are the `nodeKind` attribute Sigma indexes on: memory nodes are
 * keyed `memory:<type>` so each memory type is separately filterable, everything
 * else uses the bare kind. This is the same resolution `nodeColor` does, just
 * taking the pre-flattened key instead of a node — so the prefix is parsed by
 * `graph-kinds` and both halves of the module agree on it.
 */
export function kindSwatch(key: string, colors: NodeColors): string {
  const memoryType = memoryTypeOfKey(key);
  if (memoryType !== undefined) {
    return MEMORY_PALETTE[memoryType] ?? colors.article;
  }
  return nodeColor(key, undefined, colors);
}

/** True when the page is in dark mode. Prefers an explicit `dark`/`light` class on <html>. */
export function readDark(): boolean {
  if (typeof document === "undefined") return true;
  if (document.documentElement.classList.contains("dark")) return true;
  if (document.documentElement.classList.contains("light")) return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
}
