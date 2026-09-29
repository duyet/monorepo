/**
 * The detail panel's markdown body, fetched on demand.
 *
 * Out of `GraphViewer` because it is a self-contained async concern: resolve the
 * selected node, fetch its raw `.md`, render wikilinks against the loaded
 * graph, and report loading. Nothing about it touches the Sigma canvas.
 */

import { useEffect, useState } from "react";
import type { GraphNode } from "../../lib/graph-types";
import {
  markdownToHtml,
  preprocessObsidian,
  stripFrontmatter,
} from "../../lib/markdown";
import { rawMdUrl } from "./graph-derive";

export function useNodeBody(
  selected: string | null,
  nodeMap: Record<string, GraphNode>
): { bodyHtml: string; bodyLoading: boolean } {
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyLoading, setBodyLoading] = useState(false);

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
      .catch((err) => {
        // Panel stays empty on a failed read, but log it — a silently blank
        // panel is indistinguishable from a note with an empty body.
        console.error(`[GraphViewer] failed to load ${url}`, err);
        if (!cancelled) setBodyHtml("");
      })
      .finally(() => {
        if (!cancelled) setBodyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected, nodeMap]);

  return { bodyHtml, bodyLoading };
}
