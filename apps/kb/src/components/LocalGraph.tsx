/**
 * Small theme-aware local graph for note sidebars.
 *
 * Renders the depth-≤2 neighborhood of the current note using Sigma.js
 * (WebGL) + a one-shot ForceAtlas2 layout (no worker — this graph is
 * small and short-lived). Depth toggle 1↔2. Click a node to navigate.
 */

import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

type GraphologyGraph = import("graphology").default;
type SigmaInstance = import("sigma").default;
type GraphologyCtor = typeof import("graphology").default;
type ForceAtlas2 = typeof import("graphology-layout-forceatlas2").default;
type SigmaCtor = typeof import("sigma").default;

export interface LocalGraphNode {
  id: string;
  label: string;
  kind: "article" | "memory" | "inbox" | "tag";
  memoryType?: string;
  href: string;
  tags: string[];
  description: string;
  updated: string;
}

export interface LocalGraphEdge {
  source: string;
  target: string;
  kind: "link" | "tag";
}

export interface LocalGraphData {
  nodes: LocalGraphNode[];
  edges: LocalGraphEdge[];
}

const KIND_COLOR: Record<string, string> = {
  article: "#6b7280",
  inbox: "#3b82f6",
  tag: "#22c55e",
};

const MEMORY_TYPE_COLOR: Record<string, string> = {
  user: "#a78bfa",
  feedback: "#f472b6",
  project: "#60a5fa",
  reference: "#f59e0b",
  tech: "#eab308",
};

function nodeColor(node: LocalGraphNode): string {
  if (node.kind === "memory") {
    return MEMORY_TYPE_COLOR[node.memoryType ?? ""] ?? KIND_COLOR.article;
  }
  return KIND_COLOR[node.kind] ?? KIND_COLOR.article;
}

/**
 * Extract the depth-≤maxDepth neighborhood of `id` from a full graph
 * (BFS over both directions of edges).
 */
export function extractLocalGraph(
  graph: { nodes: LocalGraphNode[]; edges: LocalGraphEdge[] },
  id: string,
  maxDepth = 2,
): LocalGraphData {
  const adjacency = new Map<string, Set<string>>();
  for (const edge of graph.edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Set());
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);
  }

  const depth = new Map<string, number>([[id, 0]]);
  const queue = [id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDepth = depth.get(current)!;
    if (currentDepth >= maxDepth) continue;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (depth.has(neighbor)) continue;
      depth.set(neighbor, currentDepth + 1);
      queue.push(neighbor);
    }
  }

  const includedIds = new Set(depth.keys());
  const nodes = graph.nodes.filter((n) => includedIds.has(n.id));
  const edges = graph.edges.filter(
    (e) => includedIds.has(e.source) && includedIds.has(e.target),
  );
  return { nodes, edges };
}

interface LocalGraphProps {
  nodes: LocalGraphNode[];
  edges: LocalGraphEdge[];
  currentId: string;
}

export function LocalGraph({ nodes, edges, currentId }: LocalGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [depth, setDepth] = useState<1 | 2>(2);

  const visible = useMemo(
    () => extractLocalGraph({ nodes, edges }, currentId, depth),
    [nodes, edges, currentId, depth],
  );

  useEffect(() => {
    if (!containerRef.current || visible.nodes.length === 0) return;
    let cancelled = false;
    let sigma: SigmaInstance | null = null;

    (async () => {
      const [{ default: Graph }, { default: forceAtlas2 }, { default: Sigma }] =
        await Promise.all([
          import("graphology"),
          import("graphology-layout-forceatlas2"),
          import("sigma"),
        ]);
      if (cancelled || !containerRef.current) return;

      const graph: GraphologyGraph = new (Graph as GraphologyCtor)({
        multi: false,
        type: "directed",
        allowSelfLoops: false,
      });

      const n = Math.max(visible.nodes.length, 1);
      visible.nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / n;
        const radius = node.id === currentId ? 0 : 20 + (i % 5) * 2;
        graph.addNode(node.id, {
          label: node.label,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          size: node.id === currentId ? 8 : 5,
          color: nodeColor(node),
          type: "circle",
        });
      });

      for (const edge of visible.edges) {
        if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue;
        if (graph.hasEdge(edge.source, edge.target)) continue;
        graph.addEdgeWithKey(`${edge.source}__${edge.target}`, edge.source, edge.target, {
          size: 1,
          color: "#71717a",
          type: "arrow",
        });
      }

      const sensible = (forceAtlas2 as ForceAtlas2).inferSettings(graph);
      (forceAtlas2 as ForceAtlas2).assign(graph, {
        iterations: 100,
        settings: { ...sensible, gravity: 1, scalingRatio: 8, adjustSizes: true },
      });

      sigma = new (Sigma as SigmaCtor)(graph, containerRef.current, {
        allowInvalidContainer: true,
        renderLabels: true,
        labelSize: 10,
        labelDensity: 0.2,
        labelGridCellSize: 60,
        labelRenderedSizeThreshold: 4,
        defaultNodeColor: KIND_COLOR.article,
        defaultEdgeColor: "#71717a",
        defaultEdgeType: "arrow",
        stagePadding: 20,
      });

      sigma.on("clickNode", ({ node }) => {
        if (node === currentId) return;
        const target = visible.nodes.find((n) => n.id === node);
        if (target?.href) navigate({ to: target.href });
      });
    })();

    return () => {
      cancelled = true;
      sigma?.kill();
    };
  }, [visible, currentId, navigate]);

  if (visible.nodes.length <= 1) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Local graph
        </p>
        <div className="flex gap-1 text-[10px] font-mono">
          {([1, 2] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDepth(d)}
              className={
                d === depth
                  ? "px-1.5 py-0.5 rounded border border-foreground text-foreground"
                  : "px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {d}-hop
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="h-64 w-full rounded border border-border" />
    </div>
  );
}
