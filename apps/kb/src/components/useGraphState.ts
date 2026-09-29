/**
 * The graph viewer's state bag: the refs that let the canvas run without
 * re-rendering React, the React state around them, and the derivations of the
 * fetched payload.
 *
 * This was 33 `useRef` / `useState` / `useMemo` declarations in a row at the top
 * of `GraphViewer` — a wall that had to be read in full before any of the
 * behaviour was visible, and that made the remaining effect look bigger than it
 * was. Grouping them here by *what they are* lets `GraphViewer` read as a
 * sequence of concerns: state, mount, effects, handlers, render.
 *
 * The refs fall into two kinds, and telling them apart is the whole trick:
 *
 *  - *mirrors* — `selected`, `hiddenKinds`, `orphansOnly`, `theme`, `nodeMap`,
 *    `searchHits`. React state is the source of truth and the ref is a copy the
 *    Sigma handlers read without re-rendering the overlay tree; hover alone
 *    fires on every mousemove. Re-mirrored on every render.
 *  - *handles* — `container`, `sigma`, `graph`, `layout`, `drag`, `hover`,
 *    `hoverHint`, `applyVisual`, `restartLayout`, the probe counters and
 *    `detachProbe`. Only the mount effect writes them, and nothing reads one to
 *    decide what to render, so they could not be state even if we wanted to.
 *
 * Both kinds have to be refs rather than state: the mirrors so the canvas never
 * drives a render, the handles because they only come into existence after the
 * first render has already committed.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import type { GraphData, GraphEdge, GraphNode } from "../../lib/graph-types";
import { graphNodeMatches } from "../../lib/search";
import { DEFAULT_FORCES, type ForceSettings } from "./graph-build";
import {
  buildBacklinks,
  buildDegree,
  buildNodeMap,
  listKindKeys,
  visibleSubset,
} from "./graph-derive";
import { type GraphTheme, readDark, THEME } from "./graph-theme";

// Lazy-loaded in the browser only — sigma touches WebGL at import time and
// crashes Node prerender (WebGL2RenderingContext is not defined). These are
// type-only imports, so nothing is bundled.
type GraphologyGraph = import("graphology").default;
type SigmaInstance = import("sigma").default;
type FA2SupervisorCtor =
  typeof import("graphology-layout-forceatlas2/worker").default;
type FA2Supervisor = InstanceType<FA2SupervisorCtor>;

/** Where a drag currently is, and whether it moved far enough to reheat. */
export interface DragState {
  node: string | null;
  dragging: boolean;
  moved: boolean;
}

/**
 * The imperative canvas bag. Written by the mount phases, read by the event
 * handlers and the small sync effects in `GraphViewer`. Never read to decide
 * what to render — that is what keeps hover off the React render path.
 */
export interface GraphCanvasRefs {
  /** The 2D host element Sigma mounts into, and the element the probe writes to. */
  container: RefObject<HTMLDivElement | null>;
  /** The live Sigma instance, once the async mount has resolved it. */
  sigma: RefObject<SigmaInstance | null>;
  /** The graphology graph, once built. */
  graph: RefObject<GraphologyGraph | null>;
  /** The live ForceAtlas2 worker, only between a reheat and its auto-stop. */
  layout: RefObject<FA2Supervisor | null>;
  /** Mirror: which node is being dragged. */
  drag: RefObject<DragState>;
  /** Handle: the hovered node, written by `enterNode` / cleared by `leaveNode`. */
  hover: RefObject<string | null>;
  /** Handle: the hover hint <span>, written as textContent so React never re-renders. */
  hoverHint: RefObject<HTMLSpanElement | null>;
  /** Mirror: the selected node. Written *before* `setSelected` so the reducers
   *  see the new selection on the same `applyVisual` the click triggers. */
  selected: RefObject<string | null>;
  /** Mirror: the hidden kind keys. */
  hiddenKinds: RefObject<Set<string>>;
  /** Mirror: the orphans-only flag. */
  orphansOnly: RefObject<boolean>;
  /** Handle: push the current filters/theme/hover/selection into the reducers
   *  and repaint. A no-op until the mount binds it, and reset to a no-op on
   *  teardown so a late effect can never paint a dead instance. */
  applyVisual: RefObject<() => void>;
  /** Mirror: the active theme, as the reducers and Sigma settings want it. */
  theme: RefObject<GraphTheme>;
  /** Mirror: the current search hits. */
  searchHits: RefObject<Set<string>>;
  /** Handle: 0..1 staged node-reveal front, advanced every animation frame. */
  reveal: RefObject<number>;
  /** Handle: reheat the live layout with new force settings. Set by the mount,
   *  cleared on teardown — a slider move before the mount resolves is a no-op. */
  restartLayout: RefObject<(settings: ForceSettings) => void>;
  /** Mirror: `id → node`, for hover labels and the detail panel. */
  nodeMap: RefObject<Record<string, GraphNode>>;
  /** Probe counter: every explicit repaint. */
  refreshCount: RefObject<number>;
  /** Probe counter: how many times the reducers have been bound. Must stay at
   *  1 per mount — Sigma reindexes the whole graph on every rebind. */
  reducerResetCount: RefObject<number>;
  /** Handle: detach the `window.__kbGraph` probe, if one is attached. */
  detachProbe: RefObject<(() => void) | null>;
}

/** Everything `GraphViewer` reads, plus the setters its handlers need. */
export interface GraphViewState {
  /** The imperative canvas bag — handed straight to `useGraphMount`. */
  refs: GraphCanvasRefs;

  /** The fetched `/graph-data.json` payload, or `null` until it lands. */
  data: GraphData | null;
  loadError: string | null;

  /** Pure derivations of the payload. */
  nodeMap: Record<string, GraphNode>;
  degree: Record<string, number>;
  backlinks: Record<string, string[]>;
  kinds: string[];
  /** Ids matching the search box, and the first few as dropdown suggestions. */
  matchIds: Set<string>;
  suggestions: GraphNode[];
  /** The 3D view's filtered copy — the 2D filters are applied by the reducers. */
  visible3d: { nodes: GraphNode[]; edges: GraphEdge[] };

  /** Selection, and what the detail panel shows for it. */
  selected: string | null;
  setSelected: Dispatch<SetStateAction<string | null>>;
  node: GraphNode | null;
  linkedFrom: string[];

  /** 2D filters. `hiddenKinds` is read by the reducers, so both copies ship. */
  hiddenKinds: Set<string>;
  setHiddenKinds: Dispatch<SetStateAction<Set<string>>>;
  orphansOnly: boolean;
  setOrphansOnly: Dispatch<SetStateAction<boolean>>;

  /** Search box. */
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  showSuggestions: boolean;
  setShowSuggestions: Dispatch<SetStateAction<boolean>>;
  activeSuggestion: number;
  setActiveSuggestion: Dispatch<SetStateAction<number>>;

  /** Chrome: theme, control panel, read panel, force sliders, 2D/3D. */
  dark: boolean;
  theme: GraphTheme;
  ready: boolean;
  setReady: Dispatch<SetStateAction<boolean>>;
  controlsOpen: boolean;
  setControlsOpen: Dispatch<SetStateAction<boolean>>;
  panelEnabled: boolean;
  setPanelEnabled: Dispatch<SetStateAction<boolean>>;
  forces: ForceSettings;
  setForces: Dispatch<SetStateAction<ForceSettings>>;
  view: "2d" | "3d";
  setView: Dispatch<SetStateAction<"2d" | "3d">>;
}

export function useGraphState(): GraphViewState {
  // ── The canvas bag ─────────────────────────────────────────────────────────
  // Two refs must exist outside React entirely: the container (React has to
  // attach it) and the Sigma/graph/layout handles (nothing else can create
  // them). The rest is a mirror-or-handle decision, documented above.
  const container = useRef<HTMLDivElement>(null);
  const sigma = useRef<SigmaInstance | null>(null);
  const graph = useRef<GraphologyGraph | null>(null);
  const layout = useRef<FA2Supervisor | null>(null);
  const drag = useRef<DragState>({ node: null, dragging: false, moved: false });
  const hover = useRef<string | null>(null);
  const hoverHint = useRef<HTMLSpanElement>(null);
  const selected = useRef<string | null>(null);
  const hiddenKinds = useRef<Set<string>>(new Set());
  const orphansOnly = useRef(false);
  const applyVisual = useRef<() => void>(() => {});
  const themeRef = useRef<GraphTheme>(THEME.dark);
  const searchHits = useRef<Set<string>>(new Set());
  // 0..1 staged node reveal during first load.
  const reveal = useRef(1);
  const restartLayout = useRef<(settings: ForceSettings) => void>(() => {});
  const nodeMapRef = useRef<Record<string, GraphNode>>({});
  const refreshCount = useRef(0);
  const reducerResetCount = useRef(0);
  const detachProbe = useRef<(() => void) | null>(null);

  // Stable for the life of the component: every ref above is, so this object
  // can go in dependency arrays without re-firing an effect on every render.
  const refs = useMemo<GraphCanvasRefs>(
    () => ({
      container,
      sigma,
      graph,
      layout,
      drag,
      hover,
      hoverHint,
      selected,
      hiddenKinds,
      orphansOnly,
      applyVisual,
      theme: themeRef,
      searchHits,
      reveal,
      restartLayout,
      nodeMap: nodeMapRef,
      refreshCount,
      reducerResetCount,
      detachProbe,
    }),
    []
  );

  // ── React state ────────────────────────────────────────────────────────────
  const [data, setData] = useState<GraphData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelected] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [hiddenKindsSet, setHiddenKinds] = useState<Set<string>>(new Set());
  const [orphansOnlyFlag, setOrphansOnly] = useState(false);
  const [dark, setDark] = useState(true);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [panelEnabled, setPanelEnabled] = useState(true);
  const [forces, setForces] = useState<ForceSettings>(DEFAULT_FORCES);
  const [view, setView] = useState<"2d" | "3d">("2d");

  // ── Where the values come from ─────────────────────────────────────────────

  // The prebuilt payload — no raw markdown in the bundle.
  useEffect(() => {
    let cancelled = false;
    fetch("/graph-data.json")
      .then((r) => {
        if (!r.ok) throw new Error(`graph-data.json ${r.status}`);
        return r.json();
      })
      .then((json: GraphData) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Theme detection: class on <html> + system preference.
  useEffect(() => {
    setDark(readDark());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => setDark(readDark());
    mq.addEventListener("change", onMq);
    const observer = new MutationObserver(() => setDark(readDark()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      mq.removeEventListener("change", onMq);
      observer.disconnect();
    };
  }, []);

  // ── What the payload derives ───────────────────────────────────────────────

  const nodeMap = useMemo(() => buildNodeMap(data), [data]);
  const degree = useMemo(() => buildDegree(data), [data]);
  const backlinks = useMemo(() => buildBacklinks(data), [data]);
  const kinds = useMemo(() => listKindKeys(data), [data]);

  const matchIds = useMemo(() => {
    const needle = query.trim();
    const hits = new Set<string>();
    if (!needle || !data) return hits;
    for (const n of data.nodes) {
      if (graphNodeMatches(n, needle)) hits.add(n.id);
    }
    return hits;
  }, [query, data]);

  const suggestions = useMemo(() => {
    if (!query.trim() || !data) return [];
    return data.nodes.filter((n) => matchIds.has(n.id)).slice(0, 8);
  }, [query, data, matchIds]);

  const visible3d = useMemo(
    () => visibleSubset(data, hiddenKindsSet, orphansOnlyFlag, degree),
    [data, hiddenKindsSet, orphansOnlyFlag, degree]
  );

  const theme = dark ? THEME.dark : THEME.light;
  const node = selectedId ? nodeMap[selectedId] : null;
  const linkedFrom = selectedId ? (backlinks[selectedId] ?? []) : [];

  // Mirror the render-visible state into the canvas bag. Done during render,
  // not in an effect, so the mount effect — which reads these on the very same
  // commit — never sees the previous render's value.
  selected.current = selectedId;
  hiddenKinds.current = hiddenKindsSet;
  orphansOnly.current = orphansOnlyFlag;
  themeRef.current = theme;
  nodeMapRef.current = nodeMap;

  return {
    refs,
    data,
    loadError,
    nodeMap,
    degree,
    backlinks,
    kinds,
    matchIds,
    suggestions,
    visible3d,
    selected: selectedId,
    setSelected,
    node,
    linkedFrom,
    hiddenKinds: hiddenKindsSet,
    setHiddenKinds,
    orphansOnly: orphansOnlyFlag,
    setOrphansOnly,
    query,
    setQuery,
    showSuggestions,
    setShowSuggestions,
    activeSuggestion,
    setActiveSuggestion,
    dark,
    theme,
    ready,
    setReady,
    controlsOpen,
    setControlsOpen,
    panelEnabled,
    setPanelEnabled,
    forces,
    setForces,
    view,
    setView,
  };
}
