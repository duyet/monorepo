import { Canvas, useThree } from "@react-three/fiber";
import { Float, Html, Line, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Data — same shape as the 2D HeroDiagram so the diagram stays consistent.
// Nodes are now placed on a sphere using spherical coordinates (phi, theta, r)
// instead of 2D polar (a, r). Edges are identical.
// ---------------------------------------------------------------------------

type NodeKind = "ai" | "data" | "infra";

type NodeDef = {
  id: string;
  t: string;
  kind: NodeKind;
  slug?: string; // simpleicons slug (light variant)
  dc?: string; // simpleicons dark hex
  lc?: string; // simpleicons light hex (brand color override)
  icon?: string; // custom icon URL (overrides slug)
  url?: string; // clickable link target
  phi: number; // azimuthal angle in degrees (around Y)
  theta: number; // polar angle in degrees (from +Y)
  r: number; // radius
};

// Front-facing positions: pulled toward the camera so the user sees them
// centered on screen. (x,y) is the screen-space offset, z is depth in front of
// the camera (camera is at +z, so negative z = in front of center).
// phi/theta are still filled in by the fibonacci block below for the shell nodes.
const FRONT_FACING: Record<string, [number, number, number]> = {
  mcp: [0, 2.0, -2.2],
  langgraph: [-1.5, 1.0, -1.8],
  llamaindex: [1.5, 1.0, -1.8],
  cloudflare: [-1.6, -0.2, -2.5],
  anyrouter: [0, 0.3, -2.8],
  workers: [1.6, -0.2, -2.5],
  workflow: [-1.0, -1.2, -2.0],
  airflow: [1.0, -1.2, -2.0],
  clickhouse: [0, -2.0, -1.8],
};

const nodes: NodeDef[] = [
  // Data Platform — center anchor
  { id: "dataplatform", t: "Data Platform", kind: "data", phi: 0, theta: 90, r: 3.0 },
  // AI / agents
  { id: "claude", t: "Claude", kind: "ai", slug: "anthropic", url: "https://anthropic.com", phi: 0, theta: 0, r: 0 },
  { id: "mcp", t: "Duyet MCP", kind: "ai", slug: "modelcontextprotocol", url: "https://modelcontextprotocol.io", phi: 0, theta: 0, r: 0 },
  { id: "langgraph", t: "LangGraph", kind: "ai", slug: "langchain", url: "https://langchain.com", phi: 0, theta: 0, r: 0 },
  { id: "llamaindex", t: "LlamaIndex", kind: "ai", url: "https://llamaindex.ai", phi: 0, theta: 0, r: 0 },
  { id: "opencode", t: "OpenCode", kind: "ai", url: "https://opencode.ai", phi: 0, theta: 0, r: 0 },
  { id: "anyrouter", t: "AnyRouter", kind: "ai", icon: "https://anyrouter.dev/brand/anyrouter-logo.svg", url: "https://anyrouter.dev", phi: 0, theta: 0, r: 0 },
  { id: "openrouter", t: "OpenRouter", kind: "ai", slug: "openrouter", url: "https://openrouter.ai", phi: 0, theta: 0, r: 0 },
  { id: "aisdk", t: "AI SDK", kind: "ai", slug: "vercel", url: "https://sdk.vercel.ai", phi: 0, theta: 0, r: 0 },
  // Infra
  { id: "k8s", t: "Kubernetes", kind: "infra", slug: "kubernetes", url: "https://kubernetes.io", phi: 0, theta: 0, r: 0 },
  { id: "cloudflare", t: "Cloudflare", kind: "infra", slug: "cloudflare", url: "https://cloudflare.com", phi: 0, theta: 0, r: 0 },
  { id: "workers", t: "Workers", kind: "infra", slug: "cloudflareworkers", url: "https://workers.cloudflare.com", phi: 0, theta: 0, r: 0 },
  { id: "cfagents", t: "CF Agents", kind: "infra", slug: "cloudflare", url: "https://developers.cloudflare.com/agents", phi: 0, theta: 0, r: 0 },
  { id: "workflow", t: "Workflow", kind: "infra", slug: "cloudflareworkers", url: "https://developers.cloudflare.com/workflows", phi: 0, theta: 0, r: 0 },
  { id: "pages", t: "Pages", kind: "infra", slug: "cloudflarepages", url: "https://pages.cloudflare.com", phi: 0, theta: 0, r: 0 },
  { id: "k3s", t: "K3s", kind: "infra", slug: "k3s", url: "https://k3s.io", phi: 0, theta: 0, r: 0 },
  { id: "traefik", t: "Traefik", kind: "infra", slug: "traefik", lc: "5A5A5A", url: "https://traefik.io", phi: 0, theta: 0, r: 0 },
  // Data tooling
  { id: "airflow", t: "Airflow", kind: "data", slug: "apacheairflow", url: "https://airflow.apache.org", phi: 0, theta: 0, r: 0 },
  { id: "duckdb", t: "DuckDB", kind: "data", slug: "duckdb", url: "https://duckdb.org", phi: 0, theta: 0, r: 0 },
  { id: "spark", t: "Spark", kind: "data", slug: "apachespark", url: "https://spark.apache.org", phi: 0, theta: 0, r: 0 },
  { id: "clickhouse", t: "ClickHouse", kind: "data", slug: "clickhouse", lc: "C28800", url: "https://clickhouse.com", phi: 0, theta: 0, r: 0 },
  { id: "kafka", t: "Kafka", kind: "data", slug: "apachekafka", lc: "231F20", url: "https://kafka.apache.org", phi: 0, theta: 0, r: 0 },
  { id: "qdrant", t: "Qdrant", kind: "data", slug: "qdrant", url: "https://qdrant.tech", phi: 0, theta: 0, r: 0 },
  { id: "firecrawl", t: "Firecrawl", kind: "data", url: "https://firecrawl.dev", phi: 0, theta: 0, r: 0 },
  // Frameworks & tools from KB
  { id: "tanstack", t: "TanStack", kind: "infra", slug: "tanstack", url: "https://tanstack.com", phi: 0, theta: 0, r: 0 },
  { id: "wasm", t: "WASM", kind: "data", slug: "webassembly", url: "https://webassembly.org", phi: 0, theta: 0, r: 0 },
  { id: "rust", t: "Rust", kind: "infra", slug: "rust", url: "https://rust-lang.org", phi: 0, theta: 0, r: 0 },
  { id: "blog", t: "Blog", kind: "data", url: "https://blog.duyet.net", phi: 0, theta: 0, r: 0 },
  { id: "agentstate", t: "AgentState", kind: "ai", url: "https://github.com/anthropics/agent-state", phi: 0, theta: 0, r: 0 },
  { id: "chmonitor", t: "CHMonitor", kind: "data", slug: "clickhouse", lc: "C28800", url: "https://github.com/duyet/chmonitor", phi: 0, theta: 0, r: 0 },
];

const byId = Object.fromEntries(nodes.map((n) => [n.id, n] as const));

const edges: [string, string][] = [
  // Claude → its agent ecosystem
  ["claude", "mcp"],
  ["claude", "langgraph"],
  ["claude", "llamaindex"],
  ["claude", "anyrouter"],
  ["claude", "opencode"],
  ["claude", "aisdk"],
  ["claude", "dataplatform"],
  // Duyet MCP → the runtimes that consume it
  ["mcp", "opencode"],
  ["mcp", "langgraph"],
  ["mcp", "aisdk"],
  // model routing
  ["anyrouter", "openrouter"],
  ["openrouter", "aisdk"],
  ["anyrouter", "aisdk"],
  ["langgraph", "aisdk"],
  ["langgraph", "llamaindex"],
  // Data Platform → data tooling + internal data flow
  ["dataplatform", "airflow"],
  ["dataplatform", "duckdb"],
  ["dataplatform", "spark"],
  ["dataplatform", "clickhouse"],
  ["dataplatform", "kafka"],
  ["dataplatform", "k8s"],
  ["airflow", "spark"],
  ["kafka", "clickhouse"],
  ["spark", "clickhouse"],
  ["dataplatform", "qdrant"],
  ["qdrant", "clickhouse"],
  ["qdrant", "duckdb"],
  ["dataplatform", "firecrawl"],
  ["firecrawl", "langgraph"],
  ["firecrawl", "qdrant"],
  // Cloudflare → infra
  ["cloudflare", "workers"],
  ["cloudflare", "cfagents"],
  ["cloudflare", "pages"],
  ["cfagents", "workers"],
  ["cloudflare", "k8s"],
  ["workers", "aisdk"],
  ["workers", "tanstack"],
  ["pages", "tanstack"],
  ["pages", "blog"],
  ["pages", "wasm"],
  // K8s ecosystem
  ["k8s", "k3s"],
  ["k8s", "traefik"],
  ["k3s", "traefik"],
  // Blog & tooling
  ["blog", "dataplatform"],
  ["blog", "tanstack"],
  ["blog", "wasm"],
  ["wasm", "rust"],
  // Agent ecosystem
  ["agentstate", "claude"],
  ["agentstate", "mcp"],
  ["agentstate", "langgraph"],
  // Monitoring
  ["chmonitor", "clickhouse"],
  ["chmonitor", "cloudflare"],
  ["chmonitor", "k8s"],
];

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const TAU = Math.PI / 180;

// Distribute non-anchor, non-front-facing nodes evenly across a sphere via
// fibonacci spiral so the visual radius is consistent. Per-node radius gets a
// tiny ±0.25 jitter for a touch of organic variance. dataplatform stays as
// the inner anchor; FRONT_FACING entries are pinned in front of the camera.
{
  // Convert FRONT_FACING [x,y,z] into spherical (phi, theta, r) so posOf()
  // can resolve them through the same code path as shell nodes.
  for (const [id, p] of Object.entries(FRONT_FACING)) {
    const r = Math.hypot(p[0], p[1], p[2]);
    const theta = Math.acos(p[1] / r);
    const phi = Math.atan2(p[2], p[0]);
    const n = byId[id];
    n.phi = ((phi / TAU) % 360 + 360) % 360;
    n.theta = (theta / TAU) % 360;
    n.r = r;
  }

  const shellNodes = nodes.filter(
    (n) => n.id !== "dataplatform" && !(n.id in FRONT_FACING),
  );
  const SHELL_N = shellNodes.length;
  const OUTER_R = 4.8;
  const JITTER = 0.2;
  const fibAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < SHELL_N; i++) {
    const n = shellNodes[i];
    const t = i + 0.5;
    const y = 1 - (2 * t) / SHELL_N;
    const phi = (i * fibAngle) % (Math.PI * 2);
    const theta = Math.acos(y);
    n.phi = (phi / TAU) % 360;
    n.theta = (theta / TAU) % 360;
    n.r = OUTER_R + (((i * 7) % 5) - 2) * JITTER;
  }
}

function spherical(phi: number, theta: number, r: number): [number, number, number] {
  const p = phi * TAU;
  const t = theta * TAU;
  return [
    r * Math.sin(t) * Math.cos(p),
    r * Math.cos(t),
    r * Math.sin(t) * Math.sin(p),
  ];
}

function posOf(id: string): [number, number, number] {
  const n = byId[id];
  return spherical(n.phi, n.theta, n.r);
}

// Color palette — matches the 2D diagram's CSS variables
const palette = {
  ai: {
    line: "#b54a1f",
    glow: "#f59568",
    node: "#b54a1f",
    label: "#b54a1f",
  },
  data: {
    line: "#8c8b85",
    glow: "#74736e",
    node: "#0c0c0c",
    label: "#0c0c0c",
  },
  infra: {
    line: "#a8a7a1",
    glow: "#74736e",
    node: "#8c8b85",
    label: "#8c8b85",
  },
};

// ---------------------------------------------------------------------------
// 3D Node — billboard HTML label (logo + text) anchored in 3D space
// ---------------------------------------------------------------------------

function Node({ data, reduceMotion }: { data: NodeDef; reduceMotion: boolean }) {
  const [pos] = useState(() => posOf(data.id));
  const labelColor = palette[data.kind].label;
  const hasIcon = !!data.icon || !!data.slug;

  return (
    <Float
      speed={reduceMotion ? 0 : 1.2}
      rotationIntensity={0}
      floatIntensity={reduceMotion ? 0 : 0.4}
      floatingRange={[-0.05, 0.05]}
    >
      <Html
        position={pos}
        center
        distanceFactor={8}
        style={{ pointerEvents: "auto", userSelect: "none" }}
      >
        {data.url ? (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hd-pill"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.01em",
              color: labelColor,
              background: "var(--rd-surface, #ffffff)",
              border: "1px solid var(--rd-border-2, #e8e8e6)",
              borderRadius: "999px",
              padding: "3px 9px 3px 7px",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-sans, system-ui)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              textDecoration: "none",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
          >
            {hasIcon ? <NodeIcon data={data} /> : null}
            {data.t}
          </a>
        ) : (
          <span
            className="hd-pill"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.01em",
              color: labelColor,
              background: "var(--rd-surface, #ffffff)",
              border: "1px solid var(--rd-border-2, #e8e8e6)",
              borderRadius: "999px",
              padding: "3px 9px 3px 7px",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-sans, system-ui)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            {hasIcon ? <NodeIcon data={data} /> : null}
            {data.t}
          </span>
        )}
      </Html>
    </Float>
  );
}

function NodeIcon({ data }: { data: NodeDef }) {
  // Custom icon (e.g. AnyRouter) wins over simpleicons.
  if (data.icon) {
    return (
      <img
        src={data.icon}
        alt=""
        width={11}
        height={11}
        style={{ display: "block", flexShrink: 0 }}
      />
    );
  }
  if (!data.slug) return null;
  // Use simpleicons auto-color for light + dark so it matches the theme.
  const light = `https://cdn.simpleicons.org/${data.slug}${data.lc ? `/${data.lc}` : ""}`;
  const dark = `https://cdn.simpleicons.org/${data.slug}/${data.dc || "f0f0f0"}`;
  return (
    <>
      <img
        src={light}
        alt=""
        width={11}
        height={11}
        className="hd-il"
        style={{ display: "block", flexShrink: 0 }}
      />
      <img
        src={dark}
        alt=""
        width={11}
        height={11}
        className="hd-id"
        style={{ display: "none", flexShrink: 0 }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// 3D Edge — curved line through a midpoint above the chord
// ---------------------------------------------------------------------------

function Edge({
  a,
  b,
  kind,
}: {
  a: [number, number, number];
  b: [number, number, number];
  kind: NodeKind;
}) {
  const mid: [number, number, number] = useMemo(() => {
    const m: [number, number, number] = [
      (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2,
      (a[2] + b[2]) / 2,
    ];
    // Push the midpoint outward from the origin to arc the line.
    const len = Math.hypot(m[0], m[1], m[2]) || 1;
    const lift = 1.18;
    return [
      (m[0] / len) * len * lift,
      (m[1] / len) * len * lift,
      (m[2] / len) * len * lift,
    ];
  }, [a, b]);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(...a),
          new THREE.Vector3(...mid),
          new THREE.Vector3(...b),
        ],
        false,
        "centripetal",
      ),
    [a, mid, b],
  );

  const points = useMemo(() => curve.getPoints(32), [curve]);

  return (
    <Line
      points={points}
      color={palette[kind].line}
      lineWidth={0.8}
      transparent
      opacity={0.5}
      dashed
      dashSize={0.15}
      gapSize={0.35}
    />
  );
}

// ---------------------------------------------------------------------------
// Decorative rings — concentric circles in the equatorial plane
// ---------------------------------------------------------------------------

function Rings() {
  const ringPoints = useMemo(() => {
    const radii = [2.4, 4.4, 6.5];
    const pts: [number, number, number][] = [];
    const segments = 96;
    for (const r of radii) {
      const ring: [number, number, number][] = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        ring.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
      }
      pts.push(...ring);
    }
    return pts;
  }, []);

  return (
    <>
      {[0, 1, 2].map((i) => (
        <Line
          key={i}
          points={ringPoints.slice(i * 97, (i + 1) * 97)}
          color="var(--rd-border-2, #e8e8e6)"
          lineWidth={0.8}
          transparent
          opacity={0.35 - i * 0.08}
          dashed
          dashSize={0.1}
          gapSize={0.4}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Scene — the inner R3F graph
// ---------------------------------------------------------------------------

function Scene({ reduceMotion }: { reduceMotion: boolean }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.setClearColor(0x000000, 0);
  }, [gl]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.65} />
      <directionalLight position={[8, 10, 6]} intensity={0.9} color="#ffffff" />
      <directionalLight position={[-6, -4, -8]} intensity={0.35} color="#b54a1f" />
      <pointLight position={[0, 0, 0]} intensity={0.4} color="#f59568" distance={6} />

      <Rings />

      {/* Edges first (so nodes render on top) */}
      {edges.map(([s, d], i) => {
        const kind = byId[d]?.kind ?? byId[s]?.kind ?? "infra";
        return <Edge key={`e${i}`} a={posOf(s)} b={posOf(d)} kind={kind as NodeKind} />;
      })}

      {/* Nodes */}
      {nodes.map((n) => (
        <Node key={n.id} data={n} reduceMotion={reduceMotion} />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.6}
        panSpeed={0.4}
        minDistance={4}
        maxDistance={25}
        autoRotate={false}
        makeDefault
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Public component — Canvas wrapper with reduced-motion detection
// ---------------------------------------------------------------------------

export function HeroDiagram3D() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq) {
      setReduceMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    return undefined;
  }, []);

  return (
    <div
      className="rd-hero-art"
      aria-hidden="true"
      style={{ position: "relative", width: "100%", height: "100%", minHeight: 360 }}
    >
      <Canvas
        camera={{ position: [0, 2, 14], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={() => setReady(true)}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Scene reduceMotion={reduceMotion} />
        </Suspense>
      </Canvas>

      {/* Hint badge — only while the scene is loading and motion is allowed */}
      {!ready && !reduceMotion ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "var(--rd-text-3, #8c8b85)",
            fontSize: 12,
            fontFamily: "var(--font-sans, system-ui)",
            pointerEvents: "none",
          }}
        >
          loading 3d…
        </div>
      ) : null}

      {/* Subtle control hint, fades out after first interaction */}
      <ControlHint reduceMotion={reduceMotion} />
    </div>
  );
}

function ControlHint({ reduceMotion }: { reduceMotion: boolean }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (reduceMotion) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(false), 5500);
    return () => clearTimeout(t);
  }, [reduceMotion]);
  if (reduceMotion) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        bottom: 10,
        display: "flex",
        gap: 10,
        fontSize: 10.5,
        color: "var(--rd-text-3, #8c8b85)",
        fontFamily: "var(--font-sans, system-ui)",
        opacity: visible ? 0.75 : 0,
        transition: "opacity .6s ease",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <span>drag to rotate</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>scroll to zoom</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>right-drag to pan</span>
    </div>
  );
}
