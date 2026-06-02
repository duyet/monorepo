import { useEffect, useRef, useState, type MouseEvent } from "react";

export function HeroDiagram() {
  const cx = 260, cy = 220;

  // Nodes positioned around the core; angle (a) + radius (r) are layout-only.
  const nodes: {
    id: string;
    t: string;
    kind: "ai" | "data" | "infra";
    slug?: string;
    lc?: string;
    dc?: string;
    icon?: string;
    a: number;
    r: number;
  }[] = [
    // AI / agents
    { id: "claude", t: "Claude", kind: "ai", slug: "anthropic", a: 256, r: 92 },
    { id: "mcp", t: "Duyet MCP", kind: "ai", slug: "modelcontextprotocol", a: 292, r: 120 },
    { id: "langgraph", t: "LangGraph", kind: "ai", slug: "langchain", a: 216, r: 134 },
    { id: "llamaindex", t: "LlamaIndex", kind: "ai", a: 198, r: 182 },
    { id: "opencode", t: "OpenCode", kind: "ai", a: 234, r: 182 },
    { id: "anyrouter", t: "AnyRouter", kind: "ai", icon: "https://anyrouter.dev/brand/anyrouter-logo.svg", a: 272, r: 168 },
    { id: "openrouter", t: "OpenRouter", kind: "ai", slug: "openrouter", a: 312, r: 184 },
    { id: "aisdk", t: "AI SDK", kind: "ai", slug: "vercel", a: 336, r: 138 },
    // Data
    { id: "dataplatform", t: "Data Platform", kind: "data", a: 95, r: 72 },
    { id: "airflow", t: "Airflow", kind: "data", slug: "apacheairflow", a: 36, r: 150 },
    { id: "duckdb", t: "DuckDB", kind: "data", slug: "duckdb", a: 16, r: 178 },
    { id: "spark", t: "Spark", kind: "data", slug: "apachespark", a: 52, r: 178 },
    { id: "clickhouse", t: "ClickHouse", kind: "data", slug: "clickhouse", lc: "C28800", a: 84, r: 182 },
    { id: "kafka", t: "Kafka", kind: "data", slug: "apachekafka", lc: "231F20", a: 110, r: 170 },
    { id: "qdrant", t: "Qdrant", kind: "data", slug: "qdrant", a: 74, r: 116 },
    { id: "firecrawl", t: "Firecrawl", kind: "data", a: 128, r: 156 },
    // Infra
    { id: "k8s", t: "Kubernetes", kind: "infra", slug: "kubernetes", a: 122, r: 112 },
    { id: "cloudflare", t: "Cloudflare", kind: "infra", slug: "cloudflare", a: 165, r: 120 },
    { id: "workers", t: "Workers", kind: "infra", slug: "cloudflareworkers", a: 148, r: 182 },
    { id: "cfagents", t: "CF Agents", kind: "infra", slug: "cloudflare", a: 186, r: 150 },
  ];

  const byId = Object.fromEntries(
    nodes.map((n) => [n.id, n] as const)
  ) as Record<string, (typeof nodes)[number]>;

  // Related-node connections (not radial spokes). "core" = the agent hub.
  // 1→n hub fan-out + meaningful cross-links between related tools.
  const edges: [string, string][] = [
    // Claude → its agent ecosystem
    ["claude", "mcp"], ["claude", "langgraph"], ["claude", "llamaindex"],
    ["claude", "anyrouter"], ["claude", "opencode"], ["claude", "aisdk"],
    ["claude", "dataplatform"],
    // Duyet MCP → the runtimes that consume it
    ["mcp", "opencode"], ["mcp", "langgraph"], ["mcp", "aisdk"],
    // model routing
    ["anyrouter", "openrouter"], ["openrouter", "aisdk"], ["anyrouter", "aisdk"],
    ["langgraph", "aisdk"], ["langgraph", "llamaindex"],
    // Data Platform → data tooling + internal data flow
    ["dataplatform", "airflow"], ["dataplatform", "duckdb"], ["dataplatform", "spark"],
    ["dataplatform", "clickhouse"], ["dataplatform", "kafka"], ["dataplatform", "k8s"],
    ["airflow", "spark"], ["kafka", "clickhouse"], ["spark", "clickhouse"],
    ["dataplatform", "qdrant"], ["qdrant", "clickhouse"], ["qdrant", "duckdb"],
    ["dataplatform", "firecrawl"], ["firecrawl", "langgraph"], ["firecrawl", "qdrant"],
    // Cloudflare → infra
    ["cloudflare", "workers"], ["cloudflare", "cfagents"], ["cfagents", "workers"],
    ["cloudflare", "k8s"], ["workers", "aisdk"],
  ];

  const kindColor = { ai: "var(--rd-accent)", data: "var(--rd-text)", infra: "var(--rd-text-3)" };
  const kindOp = { ai: 0.8, data: 0.5, infra: 0.42 };
  const _lite = (n: any) => n.icon || `https://cdn.simpleicons.org/${n.slug}${n.lc ? `/${n.lc}` : ""}`;
  const _dark = (n: any) => n.icon || `https://cdn.simpleicons.org/${n.slug}/${n.dc || "f0f0f0"}`;

  const pos = (a: number, r: number): [number, number] => {
    const rad = (a * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const ptOf = (id: string): [number, number] =>
    id === "core" ? [cx, cy] : pos(byId[id].a, byId[id].r);

  // Gentle arc between two points: control point offset perpendicular to mid.
  const edgePath = (p1: [number, number], p2: [number, number]) => {
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const curv = 0.13;
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${(mx - dy * curv).toFixed(1)} ${(my + dx * curv).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };

  // Pointer parallax — depth via different translate rates per layer.
  const [par, setPar] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const reduceRef = useRef(false);
  useEffect(() => {
    reduceRef.current =
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduceRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setPar({ x: nx, y: ny }));
  };
  const onLeave = () => setPar({ x: 0, y: 0 });
  const layer = (depth: number) => ({
    transform: `translate(${(par.x * depth).toFixed(2)}px, ${(par.y * depth).toFixed(2)}px)`,
    transition: "transform .35s cubic-bezier(.22,.61,.36,1)",
  });

  return (
    <div
      className="rd-hero-art"
      aria-hidden="true"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <svg viewBox="0 0 520 440" preserveAspectRatio="xMidYMid meet">
        <defs>
          <style>{`.hd-id{display:none}.dark .hd-id{display:inline}.dark .hd-il{display:none}`}</style>
        </defs>

        {/* Decorative rings — back parallax layer */}
        <g style={layer(4)}>
          <circle cx={cx} cy={cy} r="112" fill="none" stroke="var(--rd-border-2)" strokeWidth="0.6" strokeDasharray="2 7" opacity="0.36" />
          <circle cx={cx} cy={cy} r="184" fill="none" stroke="var(--rd-border-2)" strokeWidth="0.6" strokeDasharray="2 7" opacity="0.24" />
        </g>

        {/* Graph (edges + nodes + core) — foreground parallax layer */}
        <g style={layer(15)}>
          {/* Connections between related nodes */}
          {edges.map(([s, d], i) => {
            const dd = edgePath(ptOf(s), ptOf(d));
            const k = byId[d]?.kind || byId[s]?.kind || "infra";
            return (
              <g key={`e${i}`}>
                <path d={dd} fill="none" stroke="var(--rd-border-2)" strokeWidth="0.8" />
                <path d={dd} fill="none" stroke={kindColor[k as keyof typeof kindColor]} strokeWidth="1.1" strokeDasharray="2 8" className="rd-flow" style={{ animationDelay: `${i * 0.11}s`, opacity: kindOp[k as keyof typeof kindOp] }} />
              </g>
            );
          })}

          {/* Tech pills with logos */}
          {nodes.map((n, i) => {
            const [px, py] = pos(n.a, n.r);
            const hasIcon = !!n.slug || !!n.icon;
            const w = n.t.length * 6.4 + (hasIcon ? 38 : 22);
            const h = 24;
            const x0 = px - w / 2;
            return (
              <g key={`p${i}`}>
                <rect x={x0} y={py - h / 2} width={w} height={h} rx="12" fill="var(--rd-surface)" stroke="var(--rd-border-2)" strokeWidth="1.1" />
                {hasIcon && n.icon && <image href={n.icon} x={x0 + 8} y={py - 5} width={10} height={10} />}
                {hasIcon && !n.icon && <image href={_lite(n)} x={x0 + 8} y={py - 5} width={10} height={10} className="hd-il" />}
                {hasIcon && !n.icon && <image href={_dark(n)} x={x0 + 8} y={py - 5} width={10} height={10} className="hd-id" />}
                <text
                  x={x0 + (hasIcon ? 22 : 11)}
                  y={py + 3.5}
                  className="rd-chip"
                  style={{ fontSize: 10.5, fontVariantNumeric: "tabular-nums", fill: n.kind === "ai" ? "var(--rd-accent-ink)" : "var(--rd-text-2)" }}
                >
                  {n.t}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
