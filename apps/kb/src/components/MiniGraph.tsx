/**
 * Mini local graph for the article sidebar.
 *
 * Renders the current article (center) and its 1-hop neighbors as a
 * static radial SVG layout — no force simulation, no CDN dependencies.
 * Outgoing links are drawn with a directional arrow; incoming with dashed line.
 */

import { Link } from "@tanstack/react-router";
import type { ContentItem } from "../../lib/content";

function itemUrl(item: ContentItem): string {
  return "memoryType" in item ? `/m/${item.slug}` : `/k/${item.slug}`;
}

interface MiniGraphProps {
  currentSlug: string;
  currentTitle: string;
  outgoing: ContentItem[];
  incoming: ContentItem[];
}

const W = 220;
const CX = W / 2;
const CY = W / 2;
const ORBIT = 78; // radius of neighbor ring
const CENTER_R = 8;
const NODE_R = 5;

function radialPos(i: number, total: number, offset = 0) {
  const angle = (2 * Math.PI * i) / total + offset - Math.PI / 2;
  return {
    x: CX + ORBIT * Math.cos(angle),
    y: CY + ORBIT * Math.sin(angle),
  };
}

// Shorten a title to fit inside a small label
function shortLabel(title: string, max = 18) {
  return title.length > max ? title.slice(0, max - 1) + "…" : title;
}

// Compute endpoint on the surface of a node circle to avoid line overlap
function edgeEndpoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  r: number,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: to.x - (dx / len) * r, y: to.y - (dy / len) * r };
}

export function MiniGraph({
  currentSlug,
  currentTitle,
  outgoing,
  incoming,
}: MiniGraphProps) {
  // Deduplicate: a slug can appear in both outgoing and incoming
  const outSlugs = new Set(outgoing.map((n) => n.slug));
  const inUnique = incoming.filter((n) => !outSlugs.has(n.slug));
  const allNeighbors = [...outgoing, ...inUnique];

  if (allNeighbors.length === 0) return null;

  const center = { x: CX, y: CY };

  // Spread neighbors in a full circle; start angle offset so no node lands
  // exactly at top (overlapping the center label area).
  const positions = allNeighbors.map((n, i) =>
    radialPos(i, allNeighbors.length, 0.3),
  );

  return (
    <div className="mt-6">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
        Local graph
      </p>
      <svg
        viewBox={`0 0 ${W} ${W}`}
        width={W}
        height={W}
        className="w-full max-w-[220px]"
        aria-label="Local knowledge graph"
        role="img"
      >
        <defs>
          {/* Arrow marker for outgoing edges */}
          <marker
            id="arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path
              d="M0,0 L0,6 L6,3 z"
              className="fill-muted-foreground"
              opacity="0.6"
            />
          </marker>
        </defs>

        {/* Edges */}
        {allNeighbors.map((neighbor, i) => {
          const np = positions[i];
          const isOut = outSlugs.has(neighbor.slug);
          const ep = edgeEndpoint(center, np, isOut ? NODE_R + 4 : NODE_R);
          const sp = edgeEndpoint(np, center, CENTER_R + 1);
          return (
            <line
              key={`edge-${neighbor.slug}`}
              x1={sp.x}
              y1={sp.y}
              x2={ep.x}
              y2={ep.y}
              className="stroke-border"
              strokeWidth={isOut ? 1.2 : 0.8}
              strokeDasharray={isOut ? undefined : "3 2"}
              markerEnd={isOut ? "url(#arrow)" : undefined}
              opacity={0.8}
            />
          );
        })}

        {/* Neighbor nodes */}
        {allNeighbors.map((neighbor, i) => {
          const np = positions[i];
          const isOut = outSlugs.has(neighbor.slug);
          const href = itemUrl(neighbor);
          const isCurrent = neighbor.slug === currentSlug;

          // Label: above or below based on position
          const labelY = np.y < CY ? np.y - NODE_R - 4 : np.y + NODE_R + 11;

          return (
            <g key={neighbor.slug}>
              <Link to={href as any}>
                <circle
                  cx={np.x}
                  cy={np.y}
                  r={NODE_R}
                  className={
                    isCurrent
                      ? "fill-foreground"
                      : isOut
                        ? "fill-accent stroke-accent"
                        : "fill-muted-foreground"
                  }
                  opacity={isCurrent ? 1 : 0.75}
                />
                <text
                  x={np.x}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="7.5"
                  className="fill-muted-foreground font-mono"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {shortLabel(neighbor.title ?? neighbor.slug, 16)}
                </text>
              </Link>
            </g>
          );
        })}

        {/* Center node */}
        <circle
          cx={CX}
          cy={CY}
          r={CENTER_R}
          className="fill-foreground"
        />
        <text
          x={CX}
          y={CY + CENTER_R + 11}
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="600"
          className="fill-foreground font-mono"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {shortLabel(currentTitle, 18)}
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-2 flex gap-3 text-[10px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1">
          <svg width="14" height="8" className="inline">
            <line
              x1="0"
              y1="4"
              x2="10"
              y2="4"
              className="stroke-border"
              strokeWidth="1.2"
            />
          </svg>
          links to
        </span>
        <span className="flex items-center gap-1">
          <svg width="14" height="8" className="inline">
            <line
              x1="0"
              y1="4"
              x2="10"
              y2="4"
              className="stroke-border"
              strokeWidth="0.8"
              strokeDasharray="3 2"
            />
          </svg>
          linked from
        </span>
      </div>
    </div>
  );
}
