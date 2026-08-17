import { type ReactElement, useEffect, useRef } from "react";
import { MEMORY_PALETTE } from "./graph-palette";

/**
 * 3D view of the knowledge graph (3d-force-graph / three.js).
 *
 * Lazy-loaded in the browser only and mounted on demand from GraphViewer's
 * 2D/3D toggle, so three.js never loads unless the user opts in.
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
  onSelect: (id: string) => void;
}

function nodeColor3d(node: Graph3DNode, theme: Graph3DTheme): string {
  if (node.kind === "memory")
    return MEMORY_PALETTE[node.memoryType ?? ""] ?? theme.article;
  if (node.kind === "inbox") return theme.inbox;
  if (node.kind === "tag") return theme.tag;
  return theme.article;
}

export function Graph3D({
  nodes,
  edges,
  degree,
  theme,
  onSelect,
}: Graph3DProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/suspicious/noExplicitAny: 3d-force-graph instance type is not exported cleanly
  const fgRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || nodes.length === 0) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    (async () => {
      const { default: ForceGraph3D } = await import("3d-force-graph");
      if (cancelled || !containerRef.current) return;

      const ids = new Set(nodes.map((n) => n.id));
      const data = {
        nodes: nodes.map((n) => ({ ...n })),
        links: edges
          .filter((e) => ids.has(e.source) && ids.has(e.target))
          .map((e) => ({ source: e.source, target: e.target })),
      };

      const fg = new ForceGraph3D(el)
        .graphData(data)
        .backgroundColor(theme.bg)
        .showNavInfo(false)
        .nodeLabel((n) => (n as unknown as Graph3DNode).label)
        .nodeColor((n) => nodeColor3d(n as unknown as Graph3DNode, theme))
        .nodeVal(
          (n) =>
            1 + Math.sqrt(degree[(n as unknown as Graph3DNode).id] ?? 0) * 1.5
        )
        .nodeOpacity(0.95)
        .nodeResolution(12)
        .linkColor(() => theme.edge)
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
        .width(el.clientWidth)
        .height(el.clientHeight);
      fgRef.current = fg;

      resizeObserver = new ResizeObserver(() => {
        fg.width(el.clientWidth).height(el.clientHeight);
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
  }, [nodes, edges, degree, theme]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      aria-label="Knowledge graph (3D)"
    />
  );
}
