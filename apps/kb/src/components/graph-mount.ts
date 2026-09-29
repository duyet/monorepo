/**
 * Mounting the 2D canvas: Sigma, the ForceAtlas2 worker, their event wiring and
 * their teardown.
 *
 * This is the one part of the viewer that cannot be React. Sigma needs a live
 * DOM node and a WebGL context, the four libraries that provide those touch
 * WebGL at import time (so they have to be dynamically imported or the Node
 * prerender crashes), and the whole thing arrives asynchronously. It used to be
 * a single ~250-line `useEffect` in `GraphViewer` with a nested async IIFE
 * inside it.
 *
 * **The phases stay in one effect, and that is deliberate.** They are not four
 * effects in a trenchcoat: the graph, the reducers bound to it, the FA2 worker
 * that reheats those coordinates, and the reveal loop that drives the reveal ref
 * all share one set of closure locals (`cancelled`, the FA2 auto-stop timer) and
 * one teardown. Splitting them into sibling effects would mean N async races
 * against one another's completion and N partial teardowns — the exact class of
 * bug that is invisible in a type check and shows up as a leaked WebGL context
 * or a graph that keeps moving after you left the page. What *is* wrong with the
 * old shape is that the sequence was unreadable, so what follows is the honest
 * fix: the effect is now a short ordered script, and each step below is a named
 * function that owns one phase and says what it owns.
 *
 * The order of the script is the contract. Two steps in particular are not
 * movable: the reducers are bound exactly once per Sigma instance (rebinding
 * reindexes the whole graph), and the pre-settle runs before the first Sigma
 * render (afterwards the graph visibly explodes out of its seed circle).
 */

import { useEffect } from "react";
import type { GraphData } from "../../lib/graph-types";
import {
  buildSigmaGraph,
  DEFAULT_FORCES,
  fa2Settings,
  type ForceSettings,
} from "./graph-build";
import {
  attachKbGraphProbe,
  clickFocusTarget,
  CLICK_FOCUS_MS,
  revealEase,
  revealRatio,
  REVEAL_MS,
  type SigmaProbeHost,
  SIGMA_HOMEPAGE_RENDER,
} from "./graph-motion";
import {
  createReducers,
  createVisualCtx,
  syncVisualCtx,
} from "./graph-reducers";
import type { GraphCanvasRefs, GraphViewState } from "./useGraphState";

type GraphologyGraph = import("graphology").default;
type GraphologyCtor = typeof import("graphology").default;
type SigmaInstance = import("sigma").default;
type SigmaCtor = typeof import("sigma").default;
type ForceAtlas2 = typeof import("graphology-layout-forceatlas2").default;
type FA2SupervisorCtor =
  typeof import("graphology-layout-forceatlas2/worker").default;

/** Iterations run synchronously before the first paint — see phase 3. */
const SETTLE_ITERATIONS = 600;

/**
 * Damping for the *live* worker. It only ever runs after a node drag or a force
 * slider change, so it is damped hard: nodes should glide to a new arrangement,
 * never jitter around it.
 */
const LIVE_SLOWDOWN = 25;

/** How long a reheated layout runs before it auto-stops, in ms. */
const LAYOUT_AUTO_STOP_MS = 2500;

/** The same, for a reheat caused by finishing a node drag. */
const DRAG_REHEAT_MS = 2000;

/** The four WebGL/worker constructors, resolved together before the mount runs. */
export interface GraphLibs {
  Graph: GraphologyCtor;
  forceAtlas2: ForceAtlas2;
  FA2LayoutSupervisor: FA2SupervisorCtor;
  Sigma: SigmaCtor;
}

/**
 * Everything the mount phases share, and nothing they own alone. Constructed
 * before the libraries resolve, so teardown can run on a mount that never got
 * as far as building a graph.
 */
interface Stage {
  /** The node Sigma mounts into. Non-null: the effect bails without one. */
  host: HTMLDivElement;
  data: GraphData;
  degree: Record<string, number>;
  refs: GraphCanvasRefs;
  /** False once the effect has been torn down. Every async phase checks it. */
  live: () => boolean;
  /**
   * The FA2 auto-stop handle. It is a box, not a local, because the layout
   * controller and the drag handlers both write it: a drag cancels the pending
   * auto-stop, and the layout controller cancels one a drag left behind.
   */
  stopTimer: { current: ReturnType<typeof setTimeout> | null };
  setReady: (ready: boolean) => void;
  setSelected: (id: string) => void;
}

/**
 * Phase 1 — resolve the four libraries.
 *
 * The only phase that can fail before a graph exists, and the only reason the
 * mount is async at all: `graphology`, the FA2 layout, the FA2 worker and
 * `sigma` must stay out of the SSR/prerender bundle because they touch WebGL at
 * import time.
 */
async function loadGraphLibs(): Promise<GraphLibs> {
  const [graphology, fa2Worker, forceAtlas2, sigma] = await Promise.all([
    import("graphology"),
    import("graphology-layout-forceatlas2/worker"),
    import("graphology-layout-forceatlas2"),
    import("sigma"),
  ]);
  return {
    Graph: graphology.default,
    forceAtlas2: forceAtlas2.default,
    FA2LayoutSupervisor: fa2Worker.default,
    Sigma: sigma.default,
  };
}

/**
 * Phase 2 — build the graphology graph from the payload.
 *
 * Seeding (positions, sizes, colors, `revealOrder`) belongs to `graph-build`;
 * this only runs it and parks the result where the theme-sync effect can find
 * it.
 */
function buildStageGraph(stage: Stage, Graph: GraphologyCtor): GraphologyGraph {
  const graph = buildSigmaGraph(
    Graph,
    stage.data,
    stage.degree,
    stage.refs.theme.current
  );
  stage.refs.graph.current = graph;
  return graph;
}

/**
 * Phase 3 — settle the layout synchronously, before Sigma ever renders.
 *
 * 600 unbatched iterations on the main thread. The alternative is watching the
 * graph visibly explode out of its seed circle on first paint, so this is
 * deliberately the most expensive step in the viewer.
 */
function settleLayout(forceAtlas2: ForceAtlas2, graph: GraphologyGraph): void {
  forceAtlas2.assign(graph, {
    iterations: SETTLE_ITERATIONS,
    settings: fa2Settings(graph, DEFAULT_FORCES, 1),
  });
}

/**
 * Phase 4 — instantiate Sigma, themed for the current colour scheme, and freeze
 * the camera frame.
 *
 * Owns the instance's lifetime: it is published to `refs.sigma` (so the sync
 * effects and the handlers can reach it) and zeroed on teardown. Returns `null`
 * if the effect was torn down while the imports were in flight, in which case
 * this instance has already been killed and the mount must not continue.
 */
function createSigmaStage(
  stage: Stage,
  Sigma: SigmaCtor,
  graph: GraphologyGraph
): SigmaInstance | null {
  const theme = stage.refs.theme.current;
  const sigma = new Sigma(graph, stage.host, {
    ...SIGMA_HOMEPAGE_RENDER,
    labelColor: { color: theme.label },
    defaultNodeColor: theme.article,
    defaultEdgeColor: theme.edge,
  });
  if (!stage.live()) {
    sigma.kill();
    return null;
  }
  stage.refs.sigma.current = sigma;
  stage.refs.refreshCount.current = 0;
  stage.refs.reducerResetCount.current = 0;
  // Freeze the camera frame — without a custom bbox Sigma re-fits the viewport
  // to the moving bounding box on every layout tick, which makes the whole
  // graph appear to wobble during the live phase.
  sigma.setCustomBBox(sigma.getBBox());
  return sigma;
}

/**
 * Phase 5 — bind the reducers, once, and return `applyVisual`.
 *
 * The reducers read a mutable `visualCtx` snapshot that `applyVisual` rewrites
 * in place, which is what lets hover repaint without either re-rendering React
 * or rebinding a reducer (a rebind makes Sigma reindex the whole graph).
 * `applyVisual` is also published to `refs.applyVisual` so the state-sync
 * effects in `GraphViewer` can drive it.
 */
function bindVisualReducers(
  stage: Stage,
  graph: GraphologyGraph,
  sigma: SigmaInstance
): () => void {
  const {
    hiddenKinds,
    orphansOnly,
    theme,
    searchHits,
    hover,
    selected,
    reveal,
    refreshCount,
    reducerResetCount,
    applyVisual: applyVisualRef,
  } = stage.refs;

  const visualCtx = createVisualCtx({
    hidden: hiddenKinds.current,
    theme: theme.current,
    hits: searchHits.current,
  });
  const { nodeReducer, edgeReducer } = createReducers(graph, visualCtx, reveal);
  sigma.setSetting("nodeReducer", nodeReducer);
  sigma.setSetting("edgeReducer", edgeReducer);
  reducerResetCount.current += 1;

  const applyVisual = () => {
    // Mutates visualCtx in place, so the reducers bound above see it.
    syncVisualCtx(graph, visualCtx, {
      hidden: hiddenKinds.current,
      onlyOrphans: orphansOnly.current,
      theme: theme.current,
      hits: searchHits.current,
      hover: hover.current,
      selected: selected.current,
    });
    refreshCount.current += 1;
    sigma.refresh();
  };
  applyVisualRef.current = applyVisual;
  return applyVisual;
}

/**
 * Phase 6 — attach the `window.__kbGraph` probe.
 *
 * Owns `refs.detachProbe`, replacing (and detaching) any probe left by a
 * previous mount, and re-establishing the `data-sigma-ready` attribute the
 * probe publishes.
 */
function attachStageProbe(stage: Stage, sigma: SigmaInstance): void {
  const { detachProbe, refreshCount, reducerResetCount } = stage.refs;
  detachProbe.current?.();
  detachProbe.current = attachKbGraphProbe(
    sigma as SigmaProbeHost,
    stage.host,
    {
      refreshCount: () => refreshCount.current,
      reducerResetCount: () => reducerResetCount.current,
    }
  );
}

/**
 * Phase 7 — build the live layout controller.
 *
 * The FA2 worker is *not* started here. It is built on demand and only ever run
 * for a couple of seconds at a time, because the resting graph has to be
 * perfectly still — the settled iterations above *are* the resting layout.
 * Dragging a node or moving a force slider calls the returned function.
 */
function createLayoutController(
  stage: Stage,
  FA2LayoutSupervisor: FA2SupervisorCtor,
  graph: GraphologyGraph
): (settings: ForceSettings) => void {
  return (settings) => {
    stage.refs.layout.current?.kill();
    if (stage.stopTimer.current) clearTimeout(stage.stopTimer.current);
    graph.forEachEdge((edge) =>
      graph.setEdgeAttribute(edge, "weight", settings.linkDistance)
    );
    const layout = new FA2LayoutSupervisor(graph, {
      settings: fa2Settings(graph, settings, LIVE_SLOWDOWN),
      getEdgeWeight: "weight",
    });
    layout.start();
    stage.refs.layout.current = layout;
    stage.stopTimer.current = setTimeout(
      () => layout.stop(),
      LAYOUT_AUTO_STOP_MS
    );
  };
}

/**
 * Phase 8 — the staged reveal: ease nodes in hub-first while the camera dollies
 * from a slightly wider frame into the settled one, so the load reads as one
 * motion rather than a pop plus a zoom.
 *
 * Owns `refs.reveal` for its duration and registers no teardown of its own: the
 * only way the loop stops is `stage.live()` going false, and the single frame
 * request still in flight at that point returns without asking for another.
 */
function startStagedReveal(stage: Stage, sigma: SigmaInstance): void {
  const { reveal, refreshCount } = stage.refs;
  const startedAt = performance.now();
  reveal.current = 0;
  const camera = sigma.getCamera();
  const finalRatio = camera.ratio;
  const tick = (now: number) => {
    if (!stage.live()) return;
    const linear = Math.min(1, (now - startedAt) / REVEAL_MS);
    const eased = revealEase(linear);
    reveal.current = eased;
    camera.setState({ ratio: revealRatio(finalRatio, eased) });
    refreshCount.current += 1;
    sigma.refresh();
    if (linear < 1) {
      requestAnimationFrame(tick);
    } else {
      reveal.current = 1;
    }
  };
  requestAnimationFrame(tick);
}

/**
 * Phase 9 — node dragging.
 *
 * The live worker is stopped for the duration of the drag: it copies a node's
 * `fixed` flag into its own matrix only on `start()`, so a running worker keeps
 * overwriting the coordinates being dragged. It is reheated after a drag that
 * actually moved, and not after a plain click, which also fires `downNode` —
 * reheating on click makes the graph shake.
 */
function wireDragHandlers(
  stage: Stage,
  graph: GraphologyGraph,
  sigma: SigmaInstance
): void {
  const { drag, layout } = stage.refs;
  sigma.on("downNode", (e) => {
    drag.current = { node: e.node, dragging: true, moved: false };
    if (stage.stopTimer.current) clearTimeout(stage.stopTimer.current);
    layout.current?.stop();
    if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
  });
  sigma.getMouseCaptor().on("mousemovebody", (e) => {
    const { node, dragging } = drag.current;
    if (!dragging || !node) return;
    drag.current.moved = true;
    const pos = sigma.viewportToGraph(e);
    graph.setNodeAttribute(node, "x", pos.x);
    graph.setNodeAttribute(node, "y", pos.y);
    e.preventSigmaDefault();
    e.original.preventDefault();
    e.original.stopPropagation();
  });
  const stopDrag = () => {
    if (drag.current.dragging && drag.current.moved) {
      layout.current?.start();
      stage.stopTimer.current = setTimeout(
        () => layout.current?.stop(),
        DRAG_REHEAT_MS
      );
    }
    drag.current = { node: null, dragging: false, moved: false };
  };
  sigma.getMouseCaptor().on("mouseup", stopDrag);
  sigma.getMouseCaptor().on("mouseleave", stopDrag);
}

/**
 * The hover hint strip is a text node written straight into the DOM rather than
 * React state, so sweeping the pointer across the canvas neither re-renders the
 * overlay tree nor costs a second `applyVisual` through an effect.
 */
function writeHoverHint(refs: GraphCanvasRefs, id: string | null): void {
  const el = refs.hoverHint.current;
  if (!el) return;
  el.textContent = id ? hoverHintText(refs.nodeMap.current[id]?.label, id) : "";
}

/** The hint strip reads the node's title, falling back to its raw id. */
export function hoverHintText(label: string | undefined, id: string): string {
  return ` · ${label ?? id}`;
}

/**
 * Phase 10 — hover. Ref-only, so it repaints without re-rendering anything.
 */
function wireHoverHandlers(
  stage: Stage,
  sigma: SigmaInstance,
  applyVisual: () => void
): void {
  const { hover } = stage.refs;
  const cursorTarget = () => stage.refs.container.current ?? document.body;
  sigma.on("enterNode", ({ node }) => {
    hover.current = node;
    writeHoverHint(stage.refs, node);
    cursorTarget().style.cursor = "pointer";
    applyVisual();
  });
  sigma.on("leaveNode", () => {
    hover.current = null;
    writeHoverHint(stage.refs, null);
    cursorTarget().style.cursor = "default";
    applyVisual();
  });
}

/**
 * Phase 11 — click to read.
 *
 * Selecting publishes to the ref *before* calling `setSelected`, so the
 * `applyVisual` at the end of this handler already sees the new selection. The
 * camera flies to the node's *display* position, not its graph attributes: the
 * live layout rescales graph coordinates, so the two no longer agree.
 */
function wireClickHandlers(
  stage: Stage,
  sigma: SigmaInstance,
  applyVisual: () => void
): void {
  sigma.on("clickNode", ({ node }) => {
    stage.refs.selected.current = node;
    stage.setSelected(node);
    const display = sigma.getNodeDisplayData(node);
    const camera = sigma.getCamera();
    if (display) {
      camera.animate(clickFocusTarget(display, camera.ratio), {
        duration: CLICK_FOCUS_MS,
      });
    }
    applyVisual();
  });
  sigma.on("clickStage", () => {
    stage.refs.hover.current = null;
    writeHoverHint(stage.refs, null);
    applyVisual();
  });
}

/**
 * Teardown, in reverse order of creation. Runs whether or not the mount
 * completed, so every handle is cleared unconditionally and the two published
 * callbacks are reset to no-ops — a state effect that fires after teardown must
 * not be able to reach a dead instance.
 */
function teardownStage(stage: Stage): void {
  const { refs } = stage;
  if (stage.stopTimer.current) clearTimeout(stage.stopTimer.current);
  refs.detachProbe.current?.();
  refs.detachProbe.current = null;
  if (refs.container.current) refs.container.current.style.cursor = "default";
  refs.applyVisual.current = () => {};
  refs.restartLayout.current = () => {};
  refs.layout.current?.kill();
  refs.layout.current = null;
  refs.sigma.current?.kill();
  refs.sigma.current = null;
  refs.graph.current = null;
}

/**
 * Mount the 2D canvas, and tear it down when the payload, its degrees, or the
 * 2D/3D toggle change. Takes the whole state bag from `useGraphState`; the
 * canvas is 2D-only, so `view !== "2d"` simply means "do not mount".
 */
export function useGraphMount(state: GraphViewState): void {
  const { refs, data, degree, view, setReady, setSelected } = state;
  useEffect(() => {
    const host = refs.container.current;
    if (!host || !data || view !== "2d") return;

    let cancelled = false;
    const stopTimer: { current: ReturnType<typeof setTimeout> | null } = {
      current: null,
    };
    const stage: Stage = {
      host,
      data,
      degree,
      refs,
      live: () => !cancelled,
      stopTimer,
      setReady,
      setSelected,
    };

    (async () => {
      const { Graph, forceAtlas2, FA2LayoutSupervisor, Sigma } =
        await loadGraphLibs();
      if (!stage.live()) return;
      try {
        const graph = buildStageGraph(stage, Graph);
        settleLayout(forceAtlas2, graph);
        const sigma = createSigmaStage(stage, Sigma, graph);
        if (!sigma) return;
        const applyVisual = bindVisualReducers(stage, graph, sigma);
        attachStageProbe(stage, sigma);
        refs.restartLayout.current = createLayoutController(
          stage,
          FA2LayoutSupervisor,
          graph
        );
        startStagedReveal(stage, sigma);
        wireDragHandlers(stage, graph, sigma);
        wireHoverHandlers(stage, sigma, applyVisual);
        wireClickHandlers(stage, sigma, applyVisual);
        setReady(true);
        // One more paint, so the first visible frame is themed and not the
        // seed colors the graph was built with.
        queueMicrotask(applyVisual);
      } catch (err) {
        console.error("[GraphViewer] failed to mount", err);
        setReady(false);
      }
    })().catch((err) => {
      if (!stage.live()) return;
      console.error("[GraphViewer] failed to load graph libs", err);
      setReady(false);
    });

    return () => {
      cancelled = true;
      teardownStage(stage);
    };
  }, [data, degree, view]);
}
