/**
 * Graph wire format shared by the build-time generator, the prerender route
 * loaders, and the browser graph components.
 *
 * Types only — zero runtime code, so `scripts/generate-static-files.ts` can
 * import this without pulling in `lib/content.ts` (and its `import.meta.glob`,
 * which does not exist under plain Node).
 *
 * This is the shape serialized into `public/graph-data.json`; the reader side
 * (`GraphViewer`) decodes an untrusted fetch against it, which is why the
 * producer types are shared rather than re-declared per consumer.
 */

export type NodeKind = "article" | "memory" | "inbox" | "tag";

export type EdgeKind = "link" | "tag";

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  memoryType?: string;
  href: string;
  tags: string[];
  description: string;
  updated: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  kind: EdgeKind;
}

export interface GraphData {
  generated: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
