import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphData, GraphNode } from "../../lib/graph-types";
import { graphNodeMatches } from "../../lib/search";
import { Graph3D } from "./Graph3D";
import { GraphControls } from "./GraphControls";
import { GraphDetailPanel } from "./GraphDetailPanel";
import { GraphSearchBox } from "./GraphSearchBox";
import {
  buildSigmaGraph,
  DEFAULT_FORCES,
  fa2Settings,
  type ForceSettings,
} from "./graph-build";
import {
  buildBacklinks,
  buildDegree,
  buildNodeMap,
  listKindKeys,
  visibleSubset,
} from "./graph-derive";
import {
  attachKbGraphProbe,
  SIGMA_HOMEPAGE_RENDER,
  type SigmaProbeHost,
} from "./graph-motion";
import {
  createReducers,
  createVisualCtx,
  syncVisualCtx,
} from "./graph-reducers";
import { nodeColor, readDark, THEME } from "./graph-theme";
import { useNodeBody } from "./useNodeBody";

// Lazy-loaded in the browser only — sigma touches WebGL at import time and
// crashes Node prerender (WebGL2RenderingContext is not defined). graphology is
// imported the same way so it lands in the same async chunk.
type GraphologyGraph = import("graphology").default;
type SigmaInstance = import("sigma").default;
type FA2SupervisorCtor =
  typeof import("graphology-layout-forceatlas2/worker").default;
type FA2Supervisor = InstanceType<FA2SupervisorCtor>;
type SigmaCtor = typeof import("sigma").default;

/**
 * Obsidian-style knowledge-graph viewer (homepage).
 *
 * Fetches the prebuilt /graph-data.json (no raw markdown in the bundle),
 * lays it out with a live ForceAtlas2 worker (graphology-layout-forceatlas2),
 * and renders with Sigma.js (WebGL): pan/zoom (labels and edges stay readable), node
 * drag (reheats layout), hover neighbor highlight, click-to-read detail
 * panel (markdown fetched on demand), kind/tag filters, force sliders, and
 * search. Hover highlight is ref-only so the overlay tree does not re-render.
 *
 * What is still here is the wiring: the refs that let the canvas run without
 * re-rendering React, and the mount effect that owns the Sigma instance. The
 * pieces around it are split by concern — see `graph-build` (seeding + FA2
 * settings), `graph-reducers` (how a node/edge is drawn), `graph-derive` and
 * `graph-kinds` (pure derivations of the payload), and the presentational
 * `GraphSearchBox` / `GraphControls` / `GraphDetailPanel`.
 */

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function GraphViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<SigmaInstance | null>(null);
  const graphRef = useRef<GraphologyGraph | null>(null);
  const layoutRef = useRef<FA2Supervisor | null>(null);
  const dragRef = useRef<{
    node: string | null;
    dragging: boolean;
    moved: boolean;
  }>({
    node: null,
    dragging: false,
    moved: false,
  });
  const hoverRef = useRef<string | null>(null);
  const hoverHintRef = useRef<HTMLSpanElement>(null);
  const selectedRef = useRef<string | null>(null);
  const hiddenKindsRef = useRef<Set<string>>(new Set());
  const orphansOnlyRef = useRef(false);
  const applyVisualRef = useRef<() => void>(() => {});
  const themeRef = useRef(THEME.dark);
  const searchHitsRef = useRef<Set<string>>(new Set());
  const revealRef = useRef(1); // 0..1 staged node reveal during first load
  const restartLayout = useRef<(settings: ForceSettings) => void>(() => {});
  const nodeMapRef = useRef<Record<string, GraphNode>>({});
  const refreshCountRef = useRef(0);
  const reducerResetCountRef = useRef(0);
  const detachProbeRef = useRef<(() => void) | null>(null);

  const [data, setData] = useState<GraphData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [hiddenKinds, setHiddenKinds] = useState<Set<string>>(new Set());
  const [orphansOnly, setOrphansOnly] = useState(false);
  const [dark, setDark] = useState(true);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [panelEnabled, setPanelEnabled] = useState(true);
  const [forces, setForces] = useState<ForceSettings>(DEFAULT_FORCES);
  const [view, setView] = useState<"2d" | "3d">("2d");

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

  const nodeMap = useMemo(() => buildNodeMap(data), [data]);

  const degree = useMemo(() => buildDegree(data), [data]);

  const backlinks = useMemo(() => buildBacklinks(data), [data]);

  const kinds = useMemo(() => listKindKeys(data), [data]);

  selectedRef.current = selected;
  hiddenKindsRef.current = hiddenKinds;
  orphansOnlyRef.current = orphansOnly;
  themeRef.current = dark ? THEME.dark : THEME.light;
  nodeMapRef.current = nodeMap;

  // Theme detection: class on <html> + system preference
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

  // Markdown body for detail panel — fetched on demand
  const { bodyHtml, bodyLoading } = useNodeBody(selected, nodeMap);

  // Mount Sigma + FA2 worker (dynamic import — keep WebGL libs out of SSR/prerender)
  useEffect(() => {
    if (!containerRef.current || !data || view !== "2d") return;
    let cancelled = false;
    let sigma: SigmaInstance | null = null;
    let stopTimer: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      const [
        { default: Graph },
        { default: FA2LayoutSupervisor },
        { default: forceAtlas2 },
        { default: Sigma },
      ] = await Promise.all([
        import("graphology"),
        import("graphology-layout-forceatlas2/worker"),
        import("graphology-layout-forceatlas2"),
        import("sigma"),
      ]);
      if (cancelled || !containerRef.current) return;

      try {
        const graph = buildSigmaGraph(Graph, data, degree, themeRef.current);
        graphRef.current = graph;

        // Settle the layout synchronously BEFORE the first render — otherwise
        // the graph visibly explodes from the seed circle on first paint.
        forceAtlas2.assign(graph, {
          iterations: 600,
          settings: fa2Settings(graph, DEFAULT_FORCES, 1),
        });

        sigma = new (Sigma as SigmaCtor)(graph, containerRef.current, {
          ...SIGMA_HOMEPAGE_RENDER,
          labelColor: { color: themeRef.current.label },
          defaultNodeColor: themeRef.current.article,
          defaultEdgeColor: themeRef.current.edge,
        });
        if (cancelled) {
          sigma.kill();
          return;
        }
        sigmaRef.current = sigma;
        const s = sigma;
        refreshCountRef.current = 0;
        reducerResetCountRef.current = 0;
        // Freeze the camera frame — without a custom bbox Sigma re-fits the
        // viewport to the moving bounding box on every layout tick, which
        // makes the whole graph appear to wobble during the live phase.
        s.setCustomBBox(s.getBBox());

        // Reducers read this snapshot. Rebuild it on refresh — do not call
        // setSetting("nodeReducer") again (Sigma reindexes on every bind).
        const visualCtx = createVisualCtx({
          hidden: hiddenKindsRef.current,
          theme: themeRef.current,
          hits: searchHitsRef.current,
        });
        const { nodeReducer, edgeReducer } = createReducers(
          graph,
          visualCtx,
          revealRef
        );
        s.setSetting("nodeReducer", nodeReducer);
        s.setSetting("edgeReducer", edgeReducer);
        reducerResetCountRef.current += 1;

        const applyVisual = () => {
          // Mutates visualCtx in place, so the reducers bound above see it.
          syncVisualCtx(graph, visualCtx, {
            hidden: hiddenKindsRef.current,
            onlyOrphans: orphansOnlyRef.current,
            theme: themeRef.current,
            hits: searchHitsRef.current,
            hover: hoverRef.current,
            selected: selectedRef.current,
          });
          refreshCountRef.current += 1;
          s.refresh();
        };
        applyVisualRef.current = applyVisual;

        const host = containerRef.current;
        if (host) {
          detachProbeRef.current?.();
          detachProbeRef.current = attachKbGraphProbe(
            s as SigmaProbeHost,
            host,
            {
              refreshCount: () => refreshCountRef.current,
              reducerResetCount: () => reducerResetCountRef.current,
            }
          );
        }

        // FA2 worker layout — live, auto-stop after settle, restarts on drag/slider change
        const startLayout = (settings: ForceSettings) => {
          layoutRef.current?.kill();
          if (stopTimer) clearTimeout(stopTimer);
          graph.forEachEdge((edge) =>
            graph.setEdgeAttribute(edge, "weight", settings.linkDistance)
          );
          const layout = new (FA2LayoutSupervisor as FA2SupervisorCtor)(graph, {
            // Very high slowDown: the live worker only runs on drag/slider,
            // and nodes should glide, not jitter.
            settings: fa2Settings(graph, settings, 25),
            getEdgeWeight: "weight",
          });
          layout.start();
          layoutRef.current = layout;
          stopTimer = setTimeout(() => layout.stop(), 2500);
        };
        restartLayout.current = startLayout;

        // Staged reveal: ease nodes in hub-first over ~1.4s. The layout is
        // already fully settled, so NO live physics runs afterwards — the
        // worker only starts on node drag or force-slider changes. This is
        // what keeps the resting graph perfectly still.
        const REVEAL_MS = 1400;
        const revealStart = performance.now();
        revealRef.current = 0;
        // Gentle dolly-in: start slightly zoomed out and ease to the final
        // frame while nodes fade in, so the load feels like one motion.
        const cam = s.getCamera();
        const finalRatio = cam.ratio;
        const revealTick = (now: number) => {
          if (cancelled) return;
          const linear = Math.min(1, (now - revealStart) / REVEAL_MS);
          const eased = 1 - (1 - linear) ** 3; // ease-out cubic
          revealRef.current = eased;
          cam.setState({ ratio: finalRatio * (1.3 - 0.3 * eased) });
          refreshCountRef.current += 1;
          s.refresh();
          if (linear < 1) {
            requestAnimationFrame(revealTick);
          } else {
            revealRef.current = 1;
          }
        };
        requestAnimationFrame(revealTick);

        // Drag nodes — stop the live FA2 worker while dragging (it copies `fixed`
        // into its matrix only on start(), so it would otherwise keep overwriting
        // the dragged coordinates), then restart it once the drag ends.
        s.on("downNode", (e) => {
          dragRef.current = { node: e.node, dragging: true, moved: false };
          if (stopTimer) clearTimeout(stopTimer);
          layoutRef.current?.stop();
          if (!s.getCustomBBox()) s.setCustomBBox(s.getBBox());
        });
        s.getMouseCaptor().on("mousemovebody", (e) => {
          const { node, dragging } = dragRef.current;
          if (!dragging || !node) return;
          dragRef.current.moved = true;
          const pos = s.viewportToGraph(e);
          graph.setNodeAttribute(node, "x", pos.x);
          graph.setNodeAttribute(node, "y", pos.y);
          e.preventSigmaDefault();
          e.original.preventDefault();
          e.original.stopPropagation();
        });
        const stopDrag = () => {
          // Only reheat the layout after an actual drag — a plain click also
          // fires downNode, and reheating on click makes the graph shake.
          if (dragRef.current.dragging && dragRef.current.moved) {
            layoutRef.current?.start();
            stopTimer = setTimeout(() => layoutRef.current?.stop(), 2000);
          }
          dragRef.current = { node: null, dragging: false, moved: false };
        };
        s.getMouseCaptor().on("mouseup", stopDrag);
        s.getMouseCaptor().on("mouseleave", stopDrag);

        const writeHoverHint = (id: string | null) => {
          const el = hoverHintRef.current;
          if (!el) return;
          if (!id) {
            el.textContent = "";
            return;
          }
          el.textContent = ` · ${nodeMapRef.current[id]?.label ?? id}`;
        };
        const graphCursor = () => containerRef.current ?? document.body;

        // Hover — refs + a text node, not React state (avoids re-rendering
        // the overlay tree and a second applyVisual via useEffect).
        s.on("enterNode", ({ node }) => {
          hoverRef.current = node;
          writeHoverHint(node);
          graphCursor().style.cursor = "pointer";
          applyVisual();
        });
        s.on("leaveNode", () => {
          hoverRef.current = null;
          writeHoverHint(null);
          graphCursor().style.cursor = "default";
          applyVisual();
        });

        // Click
        s.on("clickNode", ({ node }) => {
          selectedRef.current = node;
          setSelected(node);
          // Camera space, not graph space — the live FA2 layout rescales graph
          // coordinates, so raw node attrs no longer match the camera frame.
          const display = s.getNodeDisplayData(node);
          const camera = s.getCamera();
          if (display) {
            camera.animate(
              {
                x: display.x,
                y: display.y,
                ratio: Math.min(camera.ratio, 0.55),
              },
              { duration: 280 }
            );
          }
          applyVisual();
        });

        s.on("clickStage", () => {
          hoverRef.current = null;
          writeHoverHint(null);
          applyVisual();
        });

        setReady(true);
        queueMicrotask(applyVisual);
      } catch (err) {
        console.error("[GraphViewer] failed to mount", err);
        setReady(false);
      }
    })().catch((err) => {
      if (!cancelled) {
        console.error("[GraphViewer] failed to load graph libs", err);
        setReady(false);
      }
    });

    return () => {
      cancelled = true;
      if (stopTimer) clearTimeout(stopTimer);
      detachProbeRef.current?.();
      detachProbeRef.current = null;
      if (containerRef.current) containerRef.current.style.cursor = "default";
      applyVisualRef.current = () => {};
      restartLayout.current = () => {};
      layoutRef.current?.kill();
      layoutRef.current = null;
      sigmaRef.current?.kill();
      sigmaRef.current = null;
      graphRef.current = null;
    };
  }, [data, degree, view]);

  // Re-apply visuals when selection / filters change (hover is ref-only)
  useEffect(() => {
    applyVisualRef.current();
  }, [selected, hiddenKinds, orphansOnly]);

  // Re-apply theme colors on theme change (no relayout needed)
  useEffect(() => {
    const graph = graphRef.current;
    const sigma = sigmaRef.current;
    if (!graph || !sigma || !data) return;
    const theme = themeRef.current;
    graph.forEachNode((id) => {
      const meta = nodeMap[id];
      if (meta) {
        graph.setNodeAttribute(
          id,
          "color",
          nodeColor(meta.kind, meta.memoryType, theme)
        );
      }
    });
    graph.forEachEdge((edge) =>
      graph.setEdgeAttribute(edge, "color", theme.edge)
    );
    sigma.setSetting("labelColor", { color: theme.label });
    sigma.setSetting("defaultEdgeColor", theme.edge);
    applyVisualRef.current();
  }, [dark, data, nodeMap]);

  const matchIds = useMemo(() => {
    const needle = query.trim();
    const hits = new Set<string>();
    if (!needle || !data) return hits;
    for (const n of data.nodes) {
      if (graphNodeMatches(n, needle)) hits.add(n.id);
    }
    return hits;
  }, [query, data]);

  useEffect(() => {
    searchHitsRef.current = matchIds;
    applyVisualRef.current();
  }, [matchIds]);

  const focusNode = (id: string) => {
    setSelected(id);
    setShowSuggestions(false);
    const sigma = sigmaRef.current;
    const graph = graphRef.current;
    if (!sigma || !graph?.hasNode(id)) return;
    const display = sigma.getNodeDisplayData(id);
    if (!display) return;
    sigma
      .getCamera()
      .animate({ x: display.x, y: display.y, ratio: 0.45 }, { duration: 320 });
  };

  const suggestions = useMemo(() => {
    if (!query.trim() || !data) return [];
    return data.nodes.filter((n) => matchIds.has(n.id)).slice(0, 8);
  }, [query, data, matchIds]);

  const onSearchSubmit = () => {
    const active = suggestions[activeSuggestion] ?? suggestions[0];
    if (active) focusNode(active.id);
  };

  const toggleKind = (kind: string) => {
    setHiddenKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  const resetCamera = () => {
    sigmaRef.current?.getCamera().animatedReset({ duration: 300 });
  };

  const updateForce = (patch: Partial<ForceSettings>): void => {
    const next = { ...forces, ...patch };
    setForces(next);
    restartLayout.current(next);
  };

  const visible3d = useMemo(
    () => visibleSubset(data, hiddenKinds, orphansOnly, degree),
    [data, hiddenKinds, orphansOnly, degree]
  );

  const node = selected ? nodeMap[selected] : null;
  const linkedFrom = selected ? (backlinks[selected] ?? []) : [];
  const theme = dark ? THEME.dark : THEME.light;

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Failed to load graph: {loadError}
      </div>
    );
  }

  return (
    <div
      className="relative flex w-full border-t border-border"
      style={{ height: "calc(100dvh - 3.5rem)" }}
    >
      {/* Graph canvas */}
      <div className="relative flex-1 min-w-0" style={{ background: theme.bg }}>
        {view === "2d" && (
          <div
            ref={containerRef}
            className="absolute inset-0"
            data-kb-graph="2d"
            data-hide-labels-on-move="false"
            data-hide-edges-on-move="false"
            data-sigma-ready={ready ? "true" : "false"}
            aria-label="Knowledge graph"
          />
        )}
        {view === "3d" && data && (
          <Graph3D
            nodes={visible3d.nodes}
            edges={visible3d.edges}
            degree={degree}
            theme={theme}
            highlightIds={matchIds}
            onSelect={(id) => setSelected(id)}
          />
        )}
        {view === "2d" && !ready && (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-mono text-muted-foreground pointer-events-none">
            {data ? "Laying out graph…" : "Loading graph…"}
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute left-3 top-3 z-10 flex max-w-[min(100%,22rem)] flex-col gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/85 p-3 text-zinc-100 backdrop-blur dark:border-zinc-700/60 dark:bg-zinc-900/85">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Graph{" "}
              {data ? `· ${data.nodes.length}n / ${data.edges.length}e` : ""}
            </span>
            <span className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={view === "3d"}
                onClick={() => setView((v) => (v === "2d" ? "3d" : "2d"))}
                title="Toggle 2D/3D view"
                className="text-xs text-zinc-200 hover:text-zinc-100"
              >
                {view === "2d" ? "3D" : "2D"}
              </button>
              <button
                type="button"
                aria-pressed={panelEnabled}
                onClick={() => setPanelEnabled((v) => !v)}
                title="Toggle the read panel shown when clicking a node"
                className={`text-xs ${panelEnabled ? "text-zinc-200" : "text-zinc-500 line-through"} hover:text-zinc-100`}
              >
                read panel
              </button>
              <button
                type="button"
                onClick={() => setControlsOpen((v) => !v)}
                className="text-xs text-zinc-400 hover:text-zinc-100"
              >
                {controlsOpen ? "collapse" : "customize"}
              </button>
            </span>
          </div>

          <GraphSearchBox
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              setShowSuggestions(true);
              setActiveSuggestion(0);
            }}
            onClear={() => {
              setQuery("");
              setShowSuggestions(false);
            }}
            showSuggestions={showSuggestions}
            onShowSuggestions={setShowSuggestions}
            activeSuggestion={activeSuggestion}
            onActiveSuggestionChange={setActiveSuggestion}
            suggestions={suggestions}
            matchCount={matchIds.size}
            onSubmit={onSearchSubmit}
            onSelect={focusNode}
            theme={theme}
          />

          <GraphControls
            open={controlsOpen}
            theme={theme}
            kinds={kinds}
            hiddenKinds={hiddenKinds}
            onToggleKind={toggleKind}
            orphansOnly={orphansOnly}
            onToggleOrphans={() => setOrphansOnly((v) => !v)}
            forces={forces}
            onForceChange={updateForce}
            onResetCamera={resetCamera}
          />

          <p className="text-[10px] font-mono text-zinc-500">
            scroll zoom · drag canvas · drag nodes · hover neighbors
            <span ref={hoverHintRef} />
          </p>
        </div>
      </div>

      {/* Detail panel — hidden until a node is selected; toggleable */}
      {panelEnabled && node && (
        <GraphDetailPanel
          node={node}
          linkedFrom={linkedFrom}
          nodeMap={nodeMap}
          bodyHtml={bodyHtml}
          bodyLoading={bodyLoading}
          theme={theme}
          onClose={() => setSelected(null)}
          onSelect={focusNode}
        />
      )}
    </div>
  );
}
