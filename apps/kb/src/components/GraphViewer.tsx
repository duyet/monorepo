import { useEffect } from "react";
import { Graph3D } from "./Graph3D";
import { GraphControls } from "./GraphControls";
import { GraphDetailPanel } from "./GraphDetailPanel";
import { GraphSearchBox } from "./GraphSearchBox";
import type { ForceSettings } from "./graph-build";
import { useGraphMount } from "./graph-mount";
import { CAMERA_RESET_MS, focusFlyTarget, FOCUS_FLY_MS } from "./graph-motion";
import { nodeColor } from "./graph-theme";
import { useGraphState } from "./useGraphState";
import { useNodeBody } from "./useNodeBody";

/**
 * Obsidian-style knowledge-graph viewer (homepage).
 *
 * Fetches the prebuilt /graph-data.json (no raw markdown in the bundle), lays
 * it out with a live ForceAtlas2 worker (graphology-layout-forceatlas2), and
 * renders with Sigma.js (WebGL): pan/zoom (labels and edges stay readable), node
 * drag (reheats layout), hover neighbor highlight, click-to-read detail panel
 * (markdown fetched on demand), kind/tag filters, force sliders, and search.
 * Hover highlight is ref-only so the overlay tree does not re-render.
 *
 * What is left here is the wiring *between* the parts, in the order it runs:
 * state, canvas mount, the effects that keep the canvas in step with that
 * state, the callbacks the controls call, and the render. Every concern below
 * this line lives in a module of its own — `useGraphState` (the refs and state
 * that let the canvas run without re-rendering React, plus the derivations of
 * the payload), `graph-mount` (the imperative Sigma/FA2 mount and its ordered
 * phases), `graph-build` (seeding + FA2 settings), `graph-reducers` (how a
 * node/edge is drawn), `graph-derive` and `graph-kinds` (pure derivations of
 * the payload), `graph-motion` (the camera and reveal contract), and the
 * presentational `GraphSearchBox` / `GraphControls` / `GraphDetailPanel`.
 */

export function GraphViewer() {
  const state = useGraphState();
  const {
    refs,
    data,
    loadError,
    nodeMap,
    degree,
    kinds,
    matchIds,
    suggestions,
    visible3d,
    selected,
    setSelected,
    node,
    linkedFrom,
    hiddenKinds,
    setHiddenKinds,
    orphansOnly,
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
    controlsOpen,
    setControlsOpen,
    panelEnabled,
    setPanelEnabled,
    forces,
    setForces,
    view,
    setView,
  } = state;

  // Markdown body for the detail panel — fetched on demand
  const { bodyHtml, bodyLoading } = useNodeBody(selected, nodeMap);

  useGraphMount(state);

  // Re-apply visuals when selection / filters change (hover is ref-only)
  useEffect(() => {
    refs.applyVisual.current();
  }, [refs, selected, hiddenKinds, orphansOnly]);

  // Re-apply theme colors on theme change (no relayout needed)
  useEffect(() => {
    const graph = refs.graph.current;
    const sigma = refs.sigma.current;
    if (!graph || !sigma || !data) return;
    const active = refs.theme.current;
    graph.forEachNode((id) => {
      const meta = nodeMap[id];
      if (meta) {
        graph.setNodeAttribute(
          id,
          "color",
          nodeColor(meta.kind, meta.memoryType, active)
        );
      }
    });
    graph.forEachEdge((edge) =>
      graph.setEdgeAttribute(edge, "color", active.edge)
    );
    sigma.setSetting("labelColor", { color: active.label });
    sigma.setSetting("defaultEdgeColor", active.edge);
    refs.applyVisual.current();
  }, [refs, dark, data, nodeMap]);

  // Re-apply visuals when the search hits change
  useEffect(() => {
    refs.searchHits.current = matchIds;
    refs.applyVisual.current();
  }, [refs, matchIds]);

  // ── Callbacks ──────────────────────────────────────────────────────────────

  const focusNode = (id: string) => {
    setSelected(id);
    setShowSuggestions(false);
    const sigma = refs.sigma.current;
    const graph = refs.graph.current;
    if (!sigma || !graph?.hasNode(id)) return;
    const display = sigma.getNodeDisplayData(id);
    if (!display) return;
    sigma
      .getCamera()
      .animate(focusFlyTarget(display), { duration: FOCUS_FLY_MS });
  };

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
    refs.sigma.current
      ?.getCamera()
      .animatedReset({ duration: CAMERA_RESET_MS });
  };

  const updateForce = (patch: Partial<ForceSettings>): void => {
    const next = { ...forces, ...patch };
    setForces(next);
    refs.restartLayout.current(next);
  };

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
            ref={refs.container}
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
            <span ref={refs.hoverHint} />
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
