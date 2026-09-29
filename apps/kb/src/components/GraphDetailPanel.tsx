/**
 * The graph's read panel: the selected node's title, kind pill, tags, and body
 * (raw markdown fetched on demand), plus whatever links to it.
 *
 * Tag nodes have no page of their own, so they get a list of the notes that
 * carry the tag instead of a body.
 */

import type { ReactElement } from "react";
import type { GraphNode } from "../../lib/graph-types";
import { KIND_LABEL } from "./graph-kinds";
import { type GraphTheme, nodeColor } from "./graph-theme";

interface GraphDetailPanelProps {
  node: GraphNode;
  /** Slugs of the nodes pointing at `node`; resolved through `nodeMap` for labels. */
  linkedFrom: string[];
  nodeMap: Record<string, GraphNode>;
  bodyHtml: string;
  bodyLoading: boolean;
  theme: GraphTheme;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function GraphDetailPanel({
  node,
  linkedFrom,
  nodeMap,
  bodyHtml,
  bodyLoading,
  theme,
  onClose,
  onSelect,
}: GraphDetailPanelProps): ReactElement {
  const isTag = node.kind === "tag";

  return (
    <aside className="w-[38%] max-w-xl overflow-y-auto border-l border-border bg-background p-5">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
          aria-label="Close panel"
        >
          close ✕
        </button>
      </div>
      <article>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="text-lg font-bold tracking-tight">{node.label}</h1>
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
          style={{
            background: nodeColor(node.kind, node.memoryType, theme),
          }}
        >
          {node.kind === "memory" ? node.memoryType : KIND_LABEL[node.kind]}
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
                  if (nodeMap[`#${t}`]) onSelect(`#${t}`);
                }}
                className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {isTag ? (
          <LinkedList
            heading="Tagged notes"
            ids={linkedFrom}
            nodeMap={nodeMap}
            onSelect={onSelect}
            empty="No notes tagged."
          />
        ) : (
          <>
            {bodyLoading && (
              <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
            )}
            {bodyHtml && (
              <div
                className="typeset typeset-kb mt-4 max-w-none"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            )}
            {linkedFrom.length > 0 && (
              <LinkedList
                heading="Linked from"
                ids={linkedFrom}
                nodeMap={nodeMap}
                onSelect={onSelect}
              />
            )}
          </>
        )}
      </article>
    </aside>
  );
}

/** "Linked from" / "Tagged notes": a heading plus clickable source slugs. */
function LinkedList({
  heading,
  ids,
  nodeMap,
  onSelect,
  empty,
}: {
  heading: string;
  ids: string[];
  nodeMap: Record<string, GraphNode>;
  onSelect: (id: string) => void;
  empty?: string;
}): ReactElement {
  return (
    <div className="mt-5">
      <h2 className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {heading}
      </h2>
      <ul className="space-y-0.5">
        {ids.map((s) => {
          const item = nodeMap[s];
          return (
            <li key={s}>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                onClick={() => onSelect(s)}
              >
                {item?.label ?? s}
              </button>
            </li>
          );
        })}
        {empty && ids.length === 0 && (
          <li className="text-sm text-muted-foreground">{empty}</li>
        )}
      </ul>
    </div>
  );
}
