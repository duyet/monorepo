import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { getAllContent, type ContentItem, type MemoryNote } from "../../lib/content";
import { markdownToHtml } from "../../lib/markdown";

/**
 * Native OKF-style knowledge-graph viewer for the homepage.
 *
 * Renders the full bundle (articles + memory notes) as a 2D cytoscape graph with
 * a click-to-read detail panel — the same UX as the standalone /viz.html, but
 * built from the app's own content loader so it shares the site shell (no iframe,
 * no CDN). cytoscape is DOM-bound, so the graph mounts client-side in an effect
 * (mirrors the existing lazy KnowledgeGraph); SSR emits the shell only.
 */

const PALETTE: Record<string, string> = {
  user: "#8b5cf6",
  feedback: "#ec4899",
  project: "#3b82f6",
  reference: "#10b981",
  tech: "#f59e0b",
  Article: "#64748b",
};

const isMemory = (it: ContentItem): it is MemoryNote => "memoryType" in it;

interface NodeData {
  id: string;
  label: string;
  type: string;
  description: string;
  tags: string[];
  resource: string;
  color: string;
}

function buildGraph() {
  const items = getAllContent();
  const bySlug = new Map(items.map((it) => [it.slug, it]));
  const nodes: NodeData[] = [];
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
      resource: isMemory(it) ? it.sources[0] ?? "" : "",
      color: PALETTE[type] ?? "#64748b",
    });
    bodies[it.slug] = it.raw ?? "";
  }

  for (const it of items) {
    const targets = isMemory(it) ? it.related : it.links;
    for (const t of targets) {
      if (t && t !== it.slug && bySlug.has(t)) {
        const key = `${it.slug}__${t}`;
        if (edgeKeys.has(key)) continue;
        edgeKeys.add(key);
        if (!backlinks[t]) backlinks[t] = [];
        backlinks[t].push(it.slug);
        degree[it.slug] = (degree[it.slug] ?? 0) + 1;
        degree[t] = (degree[t] ?? 0) + 1;
      }
    }
  }

  const elements = [
    ...nodes.map((n) => ({
      data: { ...n, size: 22 + Math.min(degree[n.id] ?? 0, 6) * 4 },
    })),
    ...[...edgeKeys].map((k) => {
      const [source, target] = k.split("__");
      return { data: { id: k, source, target } };
    }),
  ];

  return { elements, nodes, bodies, backlinks, types: [...new Set(nodes.map((n) => n.type))] };
}

export function GraphViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  // cytoscape's TS types are strict on init options; the instance is loosely typed.
  const cyRef = useRef<any>(null);
  const [nodeMap, setNodeMap] = useState<Record<string, NodeData>>({});
  const [bodies, setBodies] = useState<Record<string, string>>({});
  const [backlinks, setBacklinks] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [bodyHtml, setBodyHtml] = useState("");

  // Render the selected concept's markdown body via the app's unified pipeline.
  useEffect(() => {
    let cancelled = false;
    const md = selected ? bodies[selected] : "";
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
  }, [selected, bodies]);

  useEffect(() => {
    if (!containerRef.current) return;
    const { elements, nodes, bodies, backlinks, types } = buildGraph();
    const map: Record<string, NodeData> = {};
    for (const n of nodes) map[n.id] = n;
    setNodeMap(map);
    setBodies(bodies);
    setBacklinks(backlinks);

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "data(color)",
            width: "data(size)",
            height: "data(size)",
            color: "#64748b",
            "font-size": "10px",
            "text-valign": "bottom",
            "text-margin-y": 4,
            "text-wrap": "wrap",
            "text-max-width": 80,
          },
        },
        {
          selector: "node:selected",
          style: { "border-width": 3, "border-color": "#0f172a" },
        },
        {
          selector: "edge",
          style: {
            width: 1,
            "line-color": "#cbd5e1",
            "curve-style": "bezier",
            opacity: 0.55,
          },
        },
      ],
      layout: {
        name: "cose",
        animate: false,
        idealEdgeLength: 90,
        nodeRepulsion: 9000,
        padding: 20,
      } as any,
    } as any);
    cyRef.current = cy;
    cy.on("tap", "node", (evt: { target: { id: () => string } }) =>
      setSelected(evt.target.id()),
    );
    if (nodes[0]) setSelected(nodes[0].id);
    setReady(true);
    void types;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  const node = selected ? nodeMap[selected] : null;
  const bl = selected ? backlinks[selected] ?? [] : [];

  return (
    <div
      className="flex w-full border-t border-border"
      style={{ height: "calc(100dvh - 3.5rem)" }}
    >
      <div
        ref={containerRef}
        className="flex-1 min-w-0 bg-background"
        aria-label="Knowledge graph"
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-mono text-muted-foreground pointer-events-none">
          Loading graph…
        </div>
      )}
      <aside className="w-[40%] max-w-xl overflow-y-auto bg-background p-5">
        {node ? (
          <article>
            <h1 className="text-lg font-bold tracking-tight mb-2">{node.label}</h1>
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
                className="prose prose-sm dark:prose-invert mt-4 max-w-none"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            )}
            {bl.length > 0 && (
              <div className="mt-5">
                <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Linked from
                </h2>
                <ul className="space-y-0.5">
                  {bl.map((s) => {
                    const item = nodeMap[s];
                    return (
                      <li key={s}>
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:underline"
                          onClick={() => {
                            setSelected(s);
                            cyRef.current?.$id(s).select();
                          }}
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
