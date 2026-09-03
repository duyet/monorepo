import { type ReactElement, useEffect, useMemo, useRef, useState } from "react";
import {
  markdownToHtml,
  preprocessObsidian,
  stripFrontmatter,
} from "../../lib/markdown";
import { graphNodeMatches } from "../../lib/search";
import { Graph3D } from "./Graph3D";
import {
  attachKbGraphProbe,
  SIGMA_HOMEPAGE_RENDER,
  type SigmaProbeHost,
} from "./graph-motion";
import { MEMORY_PALETTE } from "./graph-palette";

// Lazy-loaded in the browser only — sigma/graphology touch WebGL at import time
// and crash Node prerender (WebGL2RenderingContext is not defined).
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
 * and renders with Sigma.js (WebGL): pan/zoom (labels stay readable), node
 * drag (reheats layout), hover neighbor highlight, click-to-read detail
 * panel (markdown fetched on demand), kind/tag filters, force sliders, and
 * search. Hover highlight is ref-only so the overlay tree does not re-render.
 */

type NodeKind = "article" | "memory" | "inbox" | "tag";

interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  memoryType?: string;
  href: string;
  tags: string[];
  description: string;
  updated: string;
}

interface GraphEdge {
  source: string;
  target: string;
  kind: "link" | "tag";
}

interface GraphData {
  generated: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

type AttrMap = Record<string, unknown>;

const KIND_LABEL: Record<NodeKind, string> = {
  article: "Article",
  memory: "Memory",
  inbox: "Daily",
  tag: "Tag",
};

const THEME = {
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

function nodeColor(node: GraphNode, theme: typeof THEME.light): string {
  if (node.kind === "memory")
    return MEMORY_PALETTE[node.memoryType ?? ""] ?? theme.article;
  if (node.kind === "inbox") return theme.inbox;
  if (node.kind === "tag") return theme.tag;
  return theme.article;
}

function readDark(): boolean {
  if (typeof document === "undefined") return true;
  if (document.documentElement.classList.contains("dark")) return true;
  if (document.documentElement.classList.contains("light")) return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
}

function rawMdUrl(node: GraphNode): string | null {
  if (node.kind === "tag") return null;
  return `${node.href}.md`;
}

interface ForceSettings {
  gravity: number; // center force
  scalingRatio: number; // repel force
  edgeWeightInfluence: number; // link force
  linkDistance: number; // uniform edge weight (higher = looser)
}

const DEFAULT_FORCES: ForceSettings = {
  gravity: 1,
  scalingRatio: 10,
  edgeWeightInfluence: 1,
  linkDistance: 1,
};

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
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyLoading, setBodyLoading] = useState(false);
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

  const nodeMap = useMemo(() => {
    const map: Record<string, GraphNode> = {};
    for (const n of data?.nodes ?? []) map[n.id] = n;
    return map;
  }, [data]);

  const degree = useMemo(() => {
    const deg: Record<string, number> = {};
    for (const e of data?.edges ?? []) {
      deg[e.source] = (deg[e.source] ?? 0) + 1;
      deg[e.target] = (deg[e.target] ?? 0) + 1;
    }
    return deg;
  }, [data]);

  const backlinks = useMemo(() => {
    const bl: Record<string, string[]> = {};
    for (const e of data?.edges ?? []) {
      if (!bl[e.target]) bl[e.target] = [];
      if (!bl[e.target].includes(e.source)) bl[e.target].push(e.source);
    }
    return bl;
  }, [data]);

  const kinds = useMemo(() => {
    const set = new Set<string>();
    for (const n of data?.nodes ?? []) {
      set.add(
        n.kind === "memory" ? `memory:${n.memoryType ?? "other"}` : n.kind
      );
    }
    return [...set].sort();
  }, [data]);

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
  useEffect(() => {
    let cancelled = false;
    const node = selected ? nodeMap[selected] : null;
    if (!node) {
      setBodyHtml("");
      return;
    }
    const url = rawMdUrl(node);
    if (!url) {
      setBodyHtml("");
      return;
    }
    setBodyLoading(true);
    fetch(url)
      .then((r) =>
        r.ok ? r.text() : Promise.reject(new Error(`${url} ${r.status}`))
      )
      .then((md) => {
        // Wikilinks resolve against the loaded graph (no content lib in bundle).
        const resolve = (target: string) => nodeMap[target]?.href ?? null;
        return markdownToHtml(
          preprocessObsidian(stripFrontmatter(md), resolve)
        );
      })
      .then((html) => {
        if (!cancelled) setBodyHtml(html);
      })
      .catch(() => {
        if (!cancelled) setBodyHtml("");
      })
      .finally(() => {
        if (!cancelled) setBodyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected, nodeMap]);

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
        const graph = new Graph({
          multi: false,
          type: "directed",
          allowSelfLoops: false,
        }) as GraphologyGraph;
        const n = Math.max(data.nodes.length, 1);

        // Staged reveal order: hubs first, leaves last (0..1 per node).
        const byDegree = [...data.nodes].sort(
          (a, b) => (degree[b.id] ?? 0) - (degree[a.id] ?? 0)
        );
        const revealRank = new Map(
          byDegree.map((node, i) => [
            node.id,
            i / Math.max(byDegree.length - 1, 1),
          ])
        );

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
            color: nodeColor(node, themeRef.current),
            type: "circle",
            nodeKind:
              node.kind === "memory"
                ? `memory:${node.memoryType ?? "other"}`
                : node.kind,
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
            color: themeRef.current.edge,
            type: "arrow",
            weight: 1,
            zIndex: 0,
          });
        }

        graphRef.current = graph;

        // Settle the layout synchronously BEFORE the first render — otherwise
        // the graph visibly explodes from the seed circle on first paint.
        forceAtlas2.assign(graph, {
          iterations: 600,
          settings: {
            gravity: DEFAULT_FORCES.gravity,
            scalingRatio: DEFAULT_FORCES.scalingRatio,
            edgeWeightInfluence: DEFAULT_FORCES.edgeWeightInfluence,
            strongGravityMode: true,
            barnesHutOptimize: graph.order > 80,
            adjustSizes: true,
            slowDown: 1,
            linLogMode: false,
          },
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
        const visualCtx = {
          hidden: hiddenKindsRef.current,
          onlyOrphans: false,
          theme: themeRef.current,
          hits: searchHitsRef.current,
          searching: false,
          neighbors: new Set<string>(),
          focus: null as string | null,
          sel: null as string | null,
        };
        const syncVisualCtx = () => {
          const hovered = hoverRef.current;
          const sel = selectedRef.current;
          const hits = searchHitsRef.current;
          const neighbors = new Set<string>();
          const focus = hovered ?? sel;
          if (focus && graph.hasNode(focus)) {
            neighbors.add(focus);
            graph.forEachNeighbor(focus, (nb) => neighbors.add(nb));
          }
          visualCtx.hidden = hiddenKindsRef.current;
          visualCtx.onlyOrphans = orphansOnlyRef.current;
          visualCtx.theme = themeRef.current;
          visualCtx.hits = hits;
          visualCtx.searching = hits.size > 0;
          visualCtx.neighbors = neighbors;
          visualCtx.focus = focus;
          visualCtx.sel = sel;
        };

        s.setSetting("nodeReducer", (node, attrs) => {
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
          const reveal = revealRef.current;
          if (reveal < 1) {
            // Each node fades/scales in once the reveal front passes its rank.
            const rank = (attrs.revealOrder as number) ?? 0;
            const t = (reveal - rank * 0.7) / 0.3;
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
            res.forceLabel = true;
            res.size = (attrs.size as number) * 1.25;
            res.zIndex = 2;
          }
          return res;
        });
        s.setSetting("edgeReducer", (edge, attrs) => {
          const res: AttrMap = { ...attrs };
          const {
            hidden,
            onlyOrphans,
            theme,
            hits,
            searching,
            neighbors,
            focus,
          } = visualCtx;
          const [a, b] = graph.extremities(edge);
          const aKind = graph.getNodeAttribute(a, "nodeKind") as string;
          const bKind = graph.getNodeAttribute(b, "nodeKind") as string;
          if (hidden.has(aKind) || hidden.has(bKind)) {
            res.hidden = true;
            return res;
          }
          const reveal = revealRef.current;
          if (reveal < 1) {
            // An edge appears only once both endpoints are mostly revealed.
            const ra =
              (graph.getNodeAttribute(a, "revealOrder") as number) ?? 0;
            const rb =
              (graph.getNodeAttribute(b, "revealOrder") as number) ?? 0;
            if (reveal < Math.max(ra, rb) * 0.7 + 0.2) {
              res.hidden = true;
              return res;
            }
          }
          if (onlyOrphans) {
            res.hidden = true;
            return res;
          }
          if (searching) {
            if (hits.has(a) && hits.has(b)) {
              res.color = theme.edgeHover;
              res.size = 1.2;
              res.zIndex = 1;
            } else {
              res.color = theme.dim;
              res.zIndex = 0;
            }
          } else if (focus && neighbors.size) {
            if (neighbors.has(a) && neighbors.has(b)) {
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
        });
        reducerResetCountRef.current += 1;

        const applyVisual = () => {
          syncVisualCtx();
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
            settings: {
              gravity: settings.gravity,
              scalingRatio: settings.scalingRatio,
              edgeWeightInfluence: settings.edgeWeightInfluence,
              strongGravityMode: true,
              barnesHutOptimize: graph.order > 80,
              adjustSizes: true,
              // Very high slowDown: the live worker only runs on drag/slider,
              // and nodes should glide, not jitter.
              slowDown: 25,
              linLogMode: false,
            },
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
      if (meta) graph.setNodeAttribute(id, "color", nodeColor(meta, theme));
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

  const visible3d = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };
    const nodes = data.nodes.filter((n) => {
      const k =
        n.kind === "memory" ? `memory:${n.memoryType ?? "other"}` : n.kind;
      if (hiddenKinds.has(k)) return false;
      if (orphansOnly && (degree[n.id] ?? 0) > 0) return false;
      return true;
    });
    return { nodes, edges: orphansOnly ? [] : data.edges };
  }, [data, hiddenKinds, orphansOnly, degree]);

  const node = selected ? nodeMap[selected] : null;
  const isTag = node?.kind === "tag";
  const linkedFrom = selected ? (backlinks[selected] ?? []) : [];
  const theme = dark ? THEME.dark : THEME.light;

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
            data-hide-edges-on-move="true"
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

          <div className="relative">
            <input
              id="graph-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                setActiveSuggestion(0);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setShowSuggestions(true);
                  setActiveSuggestion((i) =>
                    Math.min(i + 1, Math.max(suggestions.length - 1, 0))
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveSuggestion((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  onSearchSubmit();
                } else if (e.key === "Escape") {
                  setQuery("");
                  setShowSuggestions(false);
                }
              }}
              placeholder="Highlight nodes…"
              className="h-8 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
            {query.trim() && (
              <p className="mt-1 text-[10px] font-mono text-zinc-500">
                {matchIds.size} match{matchIds.size === 1 ? "" : "es"}
              </p>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-9 z-20 max-h-56 overflow-y-auto rounded-md border border-zinc-700 bg-zinc-900 shadow-lg">
                {suggestions.map((n, i) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActiveSuggestion(i)}
                      onClick={() => focusNode(n.id)}
                      className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-800 ${
                        i === activeSuggestion ? "bg-zinc-800" : ""
                      }`}
                    >
                      <span
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: nodeColor(n, theme) }}
                      />
                      <span className="truncate">{n.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {controlsOpen && (
            <>
              <div className="flex flex-wrap gap-1">
                {kinds.map((k) => {
                  const on = !hiddenKinds.has(k);
                  const swatch = k.startsWith("memory:")
                    ? (MEMORY_PALETTE[k.slice(7)] ?? theme.article)
                    : k === "inbox"
                      ? theme.inbox
                      : k === "tag"
                        ? theme.tag
                        : theme.article;
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleKind(k)}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-opacity"
                      style={{
                        borderColor: on ? swatch : "#3f3f46",
                        color: on ? "#fafafa" : "#71717a",
                        background: on ? `${swatch}33` : "#18181bcc",
                        opacity: on ? 1 : 0.55,
                      }}
                    >
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: swatch }}
                      />
                      {
                        KIND_LABEL[
                          k.startsWith("memory:") ? "memory" : (k as NodeKind)
                        ]
                      }
                      {k.startsWith("memory:") ? `: ${k.slice(7)}` : ""}
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={orphansOnly}
                  onClick={() => setOrphansOnly((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-opacity"
                  style={{
                    borderColor: orphansOnly ? "#f87171" : "#3f3f46",
                    color: orphansOnly ? "#fafafa" : "#71717a",
                    background: orphansOnly ? "#f8717133" : "#18181bcc",
                  }}
                >
                  orphans only
                </button>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-zinc-800 pt-2">
                <ForceSlider
                  label="Center force"
                  value={forces.gravity}
                  min={0.1}
                  max={5}
                  step={0.1}
                  onChange={(v) => updateForce({ gravity: v })}
                />
                <ForceSlider
                  label="Repel force"
                  value={forces.scalingRatio}
                  min={1}
                  max={40}
                  step={1}
                  onChange={(v) => updateForce({ scalingRatio: v })}
                />
                <ForceSlider
                  label="Link force"
                  value={forces.edgeWeightInfluence}
                  min={0}
                  max={3}
                  step={0.1}
                  onChange={(v) => updateForce({ edgeWeightInfluence: v })}
                />
                <ForceSlider
                  label="Link distance"
                  value={forces.linkDistance}
                  min={0.2}
                  max={5}
                  step={0.1}
                  onChange={(v) => updateForce({ linkDistance: v })}
                />
              </div>

              <button
                type="button"
                onClick={resetCamera}
                className="h-8 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Reset view
              </button>
            </>
          )}

          <p className="text-[10px] font-mono text-zinc-500">
            scroll zoom · drag canvas · drag nodes · hover neighbors
            <span ref={hoverHintRef} />
          </p>
        </div>
      </div>

      {/* Detail panel — hidden until a node is selected; toggleable */}
      {panelEnabled && node && (
        <aside className="w-[38%] max-w-xl overflow-y-auto border-l border-border bg-background p-5">
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
              aria-label="Close panel"
            >
              close ✕
            </button>
          </div>
          {
            <article>
              <div className="mb-3 flex items-start justify-between gap-3">
                <h1 className="text-lg font-bold tracking-tight">
                  {node.label}
                </h1>
                {node.href && (
                  <a
                    href={node.href}
                    className="shrink-0 text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Open page ↗
                  </a>
                )}
              </div>
              <span
                className="inline-block rounded-full px-2 py-0.5 text-[11px] text-white"
                style={{ background: nodeColor(node, theme) }}
              >
                {node.kind === "memory"
                  ? node.memoryType
                  : KIND_LABEL[node.kind]}
              </span>
              {node.description && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {node.description}
                </p>
              )}
              {node.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {node.tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        if (nodeMap[`#${t}`]) focusNode(`#${t}`);
                      }}
                      className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}

              {isTag ? (
                <div className="mt-5">
                  <h2 className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Tagged notes
                  </h2>
                  <ul className="space-y-0.5">
                    {linkedFrom.map((s) => {
                      const item = nodeMap[s];
                      return (
                        <li key={s}>
                          <button
                            type="button"
                            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                            onClick={() => focusNode(s)}
                          >
                            {item?.label ?? s}
                          </button>
                        </li>
                      );
                    })}
                    {linkedFrom.length === 0 && (
                      <li className="text-sm text-muted-foreground">
                        No notes tagged.
                      </li>
                    )}
                  </ul>
                </div>
              ) : (
                <>
                  {bodyLoading && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Loading…
                    </p>
                  )}
                  {bodyHtml && (
                    <div
                      className="typeset typeset-kb mt-4 max-w-none"
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    />
                  )}
                  {linkedFrom.length > 0 && (
                    <div className="mt-5">
                      <h2 className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        Linked from
                      </h2>
                      <ul className="space-y-0.5">
                        {linkedFrom.map((s) => {
                          const item = nodeMap[s];
                          return (
                            <li key={s}>
                              <button
                                type="button"
                                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                                onClick={() => focusNode(s)}
                              >
                                {item?.label ?? s}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </article>
          }
        </aside>
      )}
    </div>
  );
}

interface ForceSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function ForceSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: ForceSliderProps): ReactElement {
  return (
    <label className="flex items-center gap-2 text-[11px] text-zinc-400">
      <span className="w-24 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 accent-zinc-400"
      />
      <span className="w-8 shrink-0 text-right tabular-nums">
        {value.toFixed(1)}
      </span>
    </label>
  );
}
