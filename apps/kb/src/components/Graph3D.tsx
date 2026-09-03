import { type ReactElement, useEffect, useMemo, useRef } from "react";
import { MEMORY_PALETTE } from "./graph-palette";

/**
 * 3D view of the knowledge graph (3d-force-graph / three.js).
 *
 * Lazy-loaded in the browser only and mounted on demand from GraphViewer's
 * 2D/3D toggle, so three.js never loads unless the user opts in.
 *
 * Mount follows topology (node/edge ids). Theme and search highlight update
 * in place via refs + refresh — remounting on every keystroke was dropping
 * the camera and re-running the force layout.
 */

interface Graph3DNode {
  id: string;
  label: string;
  kind: "article" | "memory" | "inbox" | "tag";
  memoryType?: string;
  href: string;
}

interface Graph3DEdge {
  source: string;
  target: string;
}

interface Graph3DTheme {
  bg: string;
  edge: string;
  label: string;
  article: string;
  inbox: string;
  tag: string;
}

interface Graph3DProps {
  nodes: Graph3DNode[];
  edges: Graph3DEdge[];
  degree: Record<string, number>;
  theme: Graph3DTheme;
  highlightIds?: Set<string>;
  onSelect: (id: string) => void;
}

function nodeColor3d(node: Graph3DNode, theme: Graph3DTheme): string {
  if (node.kind === "memory")
    return MEMORY_PALETTE[node.memoryType ?? ""] ?? theme.article;
  if (node.kind === "inbox") return theme.inbox;
  if (node.kind === "tag") return theme.tag;
  return theme.article;
}

function topologyKey(nodes: Graph3DNode[], edges: Graph3DEdge[]): string {
  const ids = nodes.map((n) => n.id).join("\n");
  const links = edges.map((e) => `${e.source}\t${e.target}`).join("\n");
  return `${ids}\n#\n${links}`;
}

export function Graph3D({
  nodes,
  edges,
  degree,
  theme,
  highlightIds,
  onSelect,
}: Graph3DProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const highlightRef = useRef(highlightIds);
  highlightRef.current = highlightIds;
  const degreeRef = useRef(degree);
  degreeRef.current = degree;
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  const graphKey = useMemo(() => topologyKey(nodes, edges), [nodes, edges]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || nodesRef.current.length === 0) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const colorOf = (raw: unknown): string => {
      const node = raw as Graph3DNode;
      const hits = highlightRef.current;
      const currentTheme = themeRef.current;
      if (hits && hits.size > 0 && !hits.has(node.id)) {
        return currentTheme.bg === "#0a0a0a" ? "#1c1c1f" : "#e4e4e7";
      }
      return nodeColor3d(node, currentTheme);
    };

    (async () => {
      const { default: ForceGraph3D } = await import("3d-force-graph");
      if (cancelled || !containerRef.current) return;

      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;
      const ids = new Set(currentNodes.map((n) => n.id));
      const data = {
        nodes: currentNodes.map((n) => ({ ...n })),
        links: currentEdges
          .filter((e) => ids.has(e.source) && ids.has(e.target))
          .map((e) => ({ source: e.source, target: e.target })),
      };

      const { width, height } = el.getBoundingClientRect();
      const fg = new ForceGraph3D(el)
        .graphData(data)
        .backgroundColor(themeRef.current.bg)
        .showNavInfo(false)
        .nodeLabel((n) => (n as unknown as Graph3DNode).label)
        .nodeColor(colorOf)
        .nodeVal(
          (n) =>
            1 +
            Math.sqrt(
              degreeRef.current[(n as unknown as Graph3DNode).id] ?? 0
            ) *
              1.5
        )
        .nodeOpacity(0.95)
        .nodeResolution(12)
        .linkColor(() => themeRef.current.edge)
        .linkOpacity(0.3)
        .linkWidth(0.4)
        .linkDirectionalArrowLength(2.2)
        .linkDirectionalArrowRelPos(1)
        .warmupTicks(80)
        .cooldownTime(4000)
        .onNodeClick((raw) => {
          const n = raw as unknown as Graph3DNode & {
            x?: number;
            y?: number;
            z?: number;
          };
          onSelectRef.current(n.id);
          // Fly the camera toward the clicked node.
          const dist = 90;
          const len = Math.hypot(n.x ?? 0, n.y ?? 0, n.z ?? 0) || 1;
          const ratio = 1 + dist / len;
          fg.cameraPosition(
            {
              x: (n.x ?? 0) * ratio,
              y: (n.y ?? 0) * ratio,
              z: (n.z ?? 0) * ratio,
            },
            { x: n.x ?? 0, y: n.y ?? 0, z: n.z ?? 0 },
            700
          );
        })
        .width(width)
        .height(height);
      fgRef.current = fg;

      resizeObserver = new ResizeObserver((entries) => {
        const box = entries[0]?.contentRect;
        if (!box || box.width < 1 || box.height < 1) return;
        fg.width(box.width).height(box.height);
      });
      resizeObserver.observe(el);
    })().catch((err) => {
      console.error("[Graph3D] failed to load", err);
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      fgRef.current?._destructor?.();
      fgRef.current = null;
    };
  }, [graphKey]);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.backgroundColor(theme.bg);
    fg.refresh();
  }, [theme, highlightIds]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      data-kb-graph="3d"
      aria-label="Knowledge graph (3D)"
    />
  );
}
