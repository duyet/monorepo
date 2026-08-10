import { useEffect, useMemo, useRef, useState } from "react";
import { getAllContent, type ContentItem, type MemoryNote } from "../../lib/content";
import { markdownToHtml } from "../../lib/markdown";

type AttrMap = Record<string, unknown>;
type GraphologyGraph = import("graphology").default;
type SigmaInstance = import("sigma").default;

/**
 * Obsidian-style knowledge-graph viewer (homepage).
 *
 * Sigma.js (WebGL) + Graphology ForceAtlas2:
 * pan/zoom, node drag, hover neighbor highlight, click-to-read panel,
 * type filters, search, label density by zoom.
 */

const PALETTE: Record<string, string> = {
  user: "#a78bfa",
  feedback: "#f472b6",
  project: "#60a5fa",
  reference: "#34d399",
  tech: "#fbbf24",
  Article: "#94a3b8",
};

const EDGE_COLOR = "#3f3f46";
const EDGE_HOVER = "#a1a1aa";
const BG = "#0a0a0a";

const isMemory = (it: ContentItem): it is MemoryNote => "memoryType" in it;

interface NodeMeta {
  id: string;
  label: string;
  type: string;
  description: string;
  tags: string[];
  resource: string;
  color: string;
  href: string;
}

function stripWikilink(s: string): string {
  return s.replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
}

function buildGraphData() {
  const items = getAllContent();
  const bySlug = new Map(items.map((it) => [it.slug, it]));
  const nodes: NodeMeta[] = [];
  const bodies: Record<string, string> = {};
  const degree: Record<string, number> = {};
  const edgeKeys = new Set<string>();
  const backlinks: Record<string, string[]> = {};

  for (const it of items) {
    const type = isMemory(it) ? it.memoryType : "Article";
    nodes.push({
      id: it.slug,
      label: it.title || it.slug,
      type,
      description: isMemory(it) ? it.description : it.summary,
      tags: it.tags ?? [],
      resource: isMemory(it) ? (it.sources[0] ?? "") : "",
      color: PALETTE[type] ?? "#94a3b8",
      href: isMemory(it) ? `/m/${it.slug}` : `/k/${it.slug}`,
    });
    bodies[it.slug] = it.raw ?? "";
  }

  for (const it of items) {
    const targets = (isMemory(it) ? it.related : it.links).map(stripWikilink);
    for (const t of targets) {
      if (!t || t === it.slug || !bySlug.has(t)) continue;
      // Undirected edge key for layout density (still store directed backlinks)
      const undirected = [it.slug, t].sort().join("__");
      if (!edgeKeys.has(undirected)) {
        edgeKeys.add(undirected);
      }
      if (!backlinks[t]) backlinks[t] = [];
      if (!backlinks[t].includes(it.slug)) backlinks[t].push(it.slug);
      degree[it.slug] = (degree[it.slug] ?? 0) + 1;
      degree[t] = (degree[t] ?? 0) + 1;
    }
  }

  const types = [...new Set(nodes.map((n) => n.type))].sort();
  return { nodes, bodies, backlinks, degree, edgeKeys, types };
}

async function createGraphologyGraph(
  nodes: NodeMeta[],
  edgeKeys: Set<string>,
  degree: Record<string, number>,
): Promise<GraphologyGraph> {
  const [{ default: Graph }, forceAtlas2] = await Promise.all([
    import("graphology"),
    import("graphology-layout-forceatlas2"),
  ]);

  const graph = new Graph({ multi: false, type: "undirected", allowSelfLoops: false });
  const n = Math.max(nodes.length, 1);

  nodes.forEach((node, i) => {
    // Deterministic ring seed so FA2 never starts at all-zeros
    const angle = (2 * Math.PI * i) / n;
    const radius = 40 + (i % 7) * 3;
    const deg = degree[node.id] ?? 0;
    graph.addNode(node.id, {
      label: node.label,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: 4 + Math.min(deg, 12) * 0.9,
      color: node.color,
      type: "circle",
      nodeType: node.type,
      forceLabel: false,
      zIndex: 1,
    });
  });

  for (const key of edgeKeys) {
    const [source, target] = key.split("__");
    if (!graph.hasNode(source) || !graph.hasNode(target)) continue;
    if (graph.hasEdge(source, target)) continue;
    graph.addEdge(source, target, {
      size: 0.6,
      color: EDGE_COLOR,
      zIndex: 0,
    });
  }

  // FA2 — synchronous is fine for ~150 nodes; freeze after assign
  const fa2 = forceAtlas2.default;
  const sensible = fa2.inferSettings(graph);
  fa2.assign(graph, {
    iterations: 280,
    settings: {
      ...sensible,
      gravity: 0.8,
      scalingRatio: 12,
      strongGravityMode: true,
      barnesHutOptimize: graph.order > 80,
      adjustSizes: true,
      slowDown: 2,
    },
  });

  return graph;
}

export function GraphViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<SigmaInstance | null>(null);
  const graphRef = useRef<GraphologyGraph | null>(null);
  const dragRef = useRef<{ node: string | null; dragging: boolean }>({
    node: null,
    dragging: false,
  });
  const hoverRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const hiddenTypesRef = useRef<Set<string>>(new Set());
  const applyVisualRef = useRef<() => void>(() => {});

  const data = useMemo(() => buildGraphData(), []);
  const [nodeMap] = useState(() => {
    const map: Record<string, NodeMeta> = {};
    for (const n of data.nodes) map[n.id] = n;
    return map;
  });
  const [selected, setSelected] = useState<string | null>(data.nodes[0]?.id ?? null);
  const [hover, setHover] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [bodyHtml, setBodyHtml] = useState("");
  const [query, setQuery] = useState("");
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());

  selectedRef.current = selected;
  hiddenTypesRef.current = hiddenTypes;

  // Markdown body for detail panel
  useEffect(() => {
    let cancelled = false;
    const md = selected ? data.bodies[selected] : "";
    if (!md) {
      setBodyHtml("");
      return;
    }
    markdownToHtml(md).then((html) => {
      if (!cancelled) setBodyHtml(html);
    });
    return () => {
      cancelled = true;
    };
  }, [selected, data.bodies]);

  // Mount Sigma (dynamic import — keeps homepage shell loadable if WebGL/graph fails)
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let sigma: SigmaInstance | null = null;

    (async () => {
      const [{ default: Sigma }, graph] = await Promise.all([
        import("sigma"),
        createGraphologyGraph(data.nodes, data.edgeKeys, data.degree),
      ]);
      if (cancelled || !containerRef.current) return;

      graphRef.current = graph;
      sigma = new Sigma(graph, containerRef.current, {
        allowInvalidContainer: true,
        renderLabels: true,
        renderEdgeLabels: false,
        labelFont: "ui-sans-serif, system-ui, sans-serif",
        labelSize: 11,
        labelWeight: "500",
        labelColor: { color: "#a1a1aa" },
        labelDensity: 0.12,
        labelGridCellSize: 80,
        labelRenderedSizeThreshold: 8,
        defaultNodeColor: "#94a3b8",
        defaultEdgeColor: EDGE_COLOR,
        stagePadding: 40,
        minCameraRatio: 0.08,
        maxCameraRatio: 12,
      });
      sigmaRef.current = sigma;
      const s = sigma;

      const applyVisual = () => {
      const hovered = hoverRef.current;
      const sel = selectedRef.current;
      const hidden = hiddenTypesRef.current;
      const neighbors = new Set<string>();
      const focus = hovered ?? sel;
      if (focus && graph.hasNode(focus)) {
        neighbors.add(focus);
        graph.forEachNeighbor(focus, (n) => neighbors.add(n));
      }

      s.setSetting("nodeReducer", (node, attrs) => {
        const res: AttrMap = { ...attrs };
        const nodeType = graph.getNodeAttribute(node, "nodeType") as string;
        if (hidden.has(nodeType)) {
          res.hidden = true;
          return res;
        }
        res.hidden = false;
        if (focus && neighbors.size) {
          if (neighbors.has(node)) {
            res.zIndex = 2;
            res.forceLabel = node === focus;
            if (node === focus) res.size = (attrs.size as number) * 1.35;
          } else {
            res.color = "#27272a";
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
        const [a, b] = graph.extremities(edge);
        const aType = graph.getNodeAttribute(a, "nodeType") as string;
        const bType = graph.getNodeAttribute(b, "nodeType") as string;
        if (hidden.has(aType) || hidden.has(bType)) {
          res.hidden = true;
          return res;
        }
        if (focus && neighbors.size) {
          if (neighbors.has(a) && neighbors.has(b)) {
            res.color = EDGE_HOVER;
            res.size = 1.2;
            res.zIndex = 1;
          } else {
            res.color = "#1c1c1f";
            res.zIndex = 0;
          }
        }
        return res;
      });

      s.refresh();
    };
      applyVisualRef.current = applyVisual;

      // Drag nodes
      s.on("downNode", (e) => {
        dragRef.current = { node: e.node, dragging: true };
        if (!s.getCustomBBox()) s.setCustomBBox(s.getBBox());
      });
      s.getMouseCaptor().on("mousemovebody", (e) => {
        const { node, dragging } = dragRef.current;
        if (!dragging || !node) return;
        const pos = s.viewportToGraph(e);
        graph.setNodeAttribute(node, "x", pos.x);
        graph.setNodeAttribute(node, "y", pos.y);
        e.preventSigmaDefault();
        e.original.preventDefault();
        e.original.stopPropagation();
      });
      const stopDrag = () => {
        dragRef.current = { node: null, dragging: false };
      };
      s.getMouseCaptor().on("mouseup", stopDrag);
      s.getMouseCaptor().on("mouseleave", stopDrag);

      // Hover
      s.on("enterNode", ({ node }) => {
        hoverRef.current = node;
        setHover(node);
        document.body.style.cursor = "pointer";
        applyVisual();
      });
      s.on("leaveNode", () => {
        hoverRef.current = null;
        setHover(null);
        document.body.style.cursor = "default";
        applyVisual();
      });

      // Click
      s.on("clickNode", ({ node }) => {
        selectedRef.current = node;
        setSelected(node);
        const attrs = graph.getNodeAttributes(node);
        const camera = s.getCamera();
        camera.animate(
          {
            x: attrs.x as number,
            y: attrs.y as number,
            ratio: Math.min(camera.ratio, 0.55),
          },
          { duration: 280 },
        );
        applyVisual();
      });

      // Click stage clears hover focus (keep selection)
      s.on("clickStage", () => {
        hoverRef.current = null;
        setHover(null);
        applyVisual();
      });

      setReady(true);
      queueMicrotask(applyVisual);
    })().catch((err) => {
      console.error("[GraphViewer] failed to mount", err);
      setReady(false);
    });

    return () => {
      cancelled = true;
      document.body.style.cursor = "default";
      sigma?.kill();
      sigmaRef.current = null;
      graphRef.current = null;
    };
  }, [data]);

  // Re-apply when selection / type filter / hover state changes (refs already updated)
  useEffect(() => {
    applyVisualRef.current();
  }, [selected, hiddenTypes, hover]);

  const focusNode = (id: string) => {
    setSelected(id);
    const sigma = sigmaRef.current;
    const graph = graphRef.current;
    if (!sigma || !graph || !graph.hasNode(id)) return;
    const attrs = graph.getNodeAttributes(id);
    sigma.getCamera().animate(
      { x: attrs.x as number, y: attrs.y as number, ratio: 0.45 },
      { duration: 320 },
    );
  };

  const onSearch = (q: string) => {
    setQuery(q);
    const needle = q.trim().toLowerCase();
    if (!needle) return;
    const hit = data.nodes.find(
      (n) =>
        n.id.toLowerCase().includes(needle) ||
        n.label.toLowerCase().includes(needle) ||
        n.tags.some((t) => t.toLowerCase().includes(needle)),
    );
    if (hit) focusNode(hit.id);
  };

  const toggleType = (type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const resetCamera = () => {
    sigmaRef.current?.getCamera().animatedReset({ duration: 300 });
  };

  const node = selected ? nodeMap[selected] : null;
  const bl = selected ? (data.backlinks[selected] ?? []) : [];
  const hoverNode = hover ? nodeMap[hover] : null;

  return (
    <div
      className="relative flex w-full border-t border-border"
      style={{ height: "calc(100dvh - 3.5rem)" }}
    >
      {/* Graph canvas */}
      <div className="relative flex-1 min-w-0" style={{ background: BG }}>
        <div
          ref={containerRef}
          className="absolute inset-0"
          aria-label="Knowledge graph"
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-mono text-zinc-500 pointer-events-none">
            Layout graph…
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute left-3 top-3 z-10 flex max-w-[min(100%,28rem)] flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search nodes…"
              className="h-8 w-56 rounded-md border border-zinc-700 bg-zinc-900/90 px-2 text-xs text-zinc-100 placeholder:text-zinc-500 backdrop-blur focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
            <button
              type="button"
              onClick={resetCamera}
              className="h-8 rounded-md border border-zinc-700 bg-zinc-900/90 px-2 text-xs text-zinc-300 backdrop-blur hover:bg-zinc-800"
            >
              Reset view
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {data.types.map((t) => {
              const on = !hiddenTypes.has(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] backdrop-blur transition-opacity"
                  style={{
                    borderColor: on ? PALETTE[t] ?? "#71717a" : "#3f3f46",
                    color: on ? "#fafafa" : "#71717a",
                    background: on ? `${PALETTE[t] ?? "#71717a"}33` : "#18181bcc",
                    opacity: on ? 1 : 0.55,
                  }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: PALETTE[t] ?? "#71717a" }}
                  />
                  {t}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] font-mono text-zinc-500">
            scroll zoom · drag canvas · drag nodes · hover neighbors
            {hoverNode ? ` · ${hoverNode.label}` : ""}
          </p>
        </div>
      </div>

      {/* Detail panel */}
      <aside className="w-[38%] max-w-xl overflow-y-auto border-l border-border bg-background p-5">
        {node ? (
          <article>
            <div className="mb-3 flex items-start justify-between gap-3">
              <h1 className="text-lg font-bold tracking-tight">{node.label}</h1>
              <a
                href={node.href}
                className="shrink-0 text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                Open page ↗
              </a>
            </div>
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[11px] text-white"
              style={{ background: node.color }}
            >
              {node.type}
            </span>
            {node.resource && (
              <>
                {" "}
                <a
                  className="text-xs text-muted-foreground hover:underline"
                  href={node.resource}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  source ↗
                </a>
              </>
            )}
            {node.description && (
              <p className="mt-3 text-sm text-muted-foreground">{node.description}</p>
            )}
            {node.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {node.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {bodyHtml && (
              <div
                className="typeset typeset-kb mt-4 max-w-none"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            )}
            {bl.length > 0 && (
              <div className="mt-5">
                <h2 className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Linked from
                </h2>
                <ul className="space-y-0.5">
                  {bl.map((s) => {
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
          </article>
        ) : (
          <p className="text-sm text-muted-foreground">Select a node to read it.</p>
        )}
      </aside>
    </div>
  );
}
