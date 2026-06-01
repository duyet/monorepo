import { ArrowUpRight, ArrowRight, Flame } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { addUtmParams } from "../../app/lib/utm";
import rawBlogPosts from "../../../blog/public/posts-data.json";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { type AppItem, apps } from "../data/projects";
import { siblingApps } from "../data/sibling-apps";
import { SecHead, Eyebrow, Sparkline, Reveal } from "@duyet/components";

export const Route = createFileRoute("/")({
  component: HomePage,
});

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  readingTime?: number;
  thumbnail?: string;
};

const allBlogPosts: BlogPost[] = rawBlogPosts as BlogPost[];
const featuredPost = allBlogPosts[0];
const recentPosts = allBlogPosts.slice(1, 6);

const totalPosts = allBlogPosts.length;
const sinceYear = allBlogPosts.length
  ? new Date(allBlogPosts[allBlogPosts.length - 1].date).getFullYear()
  : 2015;
const yearsWriting = new Date().getFullYear() - sinceYear;

// Hand-picked to show breadth: AI infra, data, agents, DevOps, craft, type.
const SELECTED: { name: string; tag: string }[] = [
  { name: "AnyRouter", tag: "AI Infra" },
  { name: "ClickHouse Monitoring", tag: "Data" },
  { name: "AI Agents", tag: "AI" },
  { name: "Stamps", tag: "Tool" },
  { name: "Helm Charts", tag: "Infra" },
  { name: "MCP Tools", tag: "AI" },
];

const byName = new Map(apps.map((a) => [a.name, a]));
const selectedProjects = SELECTED.map(({ name, tag }) => {
  const item = byName.get(name);
  return item ? { item, tag } : null;
}).filter((x): x is { item: AppItem; tag: string } => x !== null);

// Hardcoded homelab and coding stats — real-ish values matching live cluster.
const homelabSummary = { nodesOnline: 5, nodesTotal: 6, services: 19, avgCpu: 27.6 };
const codingSparkline = [40, 52, 48, 61, 58, 72, 66, 80, 74, 69, 77, 84];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <KeyboardFeatures />
      </Suspense>

      <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
        {/* hero */}
        <section
          className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(22px,3.2vw,40px)] pb-[clamp(26px,3.5vw,40px)]"
        >
          <Reveal>
            <div className="rd-hero-grid">
              <div>
                <Eyebrow>DATA &amp; AI ENGINEER</Eyebrow>
                <h1
                  className="rd-display mt-[13px] max-w-[17ch] text-[clamp(2.05rem,4.2vw,3.3rem)] leading-[1.02]"
                >
                  I build data platforms, and the{" "}
                  <span className="text-[var(--rd-accent)]">AI agents</span>{" "}
                  that run on top of them.
                </h1>
                <p
                  className="rd-lead mt-4 max-w-[56ch] text-[clamp(0.96rem,1.15vw,1.06rem)]"
                >
                  I'm Duyet — a Senior Data &amp; AI Engineer. I spend my time
                  on the load-bearing parts of software: pipelines that move
                  data at scale, platforms that stay calm under pressure, and
                  the agents and tooling that make them genuinely useful. I like
                  systems that are simple to operate and honest about what
                  they're doing — and I{" "}
                  <a
                    href="https://github.com/duyet"
                    target="_blank"
                    rel="noreferrer"
                    className="rd-ulink"
                  >
                    open-source
                  </a>{" "}
                  most of what I build.
                </p>
                <Link
                  to="/about"
                  className="vibe-flag no-underline text-inherit"
                >
                  <span className="vf-ic grid place-items-center">
                    <Flame size={13} fill="#fff" />
                  </span>
                  <span>
                    <strong>Deep in vibe-coding mode</strong> — most of what ships here is written alongside coding agents, with me steering.
                  </span>
                  <span className="vf-arr inline-flex">
                    <ArrowRight size={14} />
                  </span>
                </Link>
                <div
                  className="flex flex-wrap items-center gap-3 mt-5"
                >
                  <Button variant="default" size="sm" asChild>
                    <a
                      href="https://blog.duyet.net"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read the blog
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href="https://cv.duyet.net"
                      target="_blank"
                      rel="noreferrer"
                    >
                      R&eacute;sum&eacute;
                    </a>
                  </Button>
                  <Button variant="link" size="sm" asChild>
                    <a
                      href="https://github.com/duyet"
                      target="_blank"
                      rel="noreferrer"
                    >
                      github.com/duyet
                    </a>
                  </Button>
                </div>
              </div>
              <HeroDiagram />
            </div>
          </Reveal>

          <Reveal delay={100} className="mt-[clamp(22px,3vw,36px)]">
            <SignalBar />
          </Reveal>
        </section>

        {/* selected work */}
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]">
          <Reveal>
            <SecHead
              num="01"
              eyebrow="Selected work"
              title="Things I've shipped"
              links={[
                {
                  label: "All projects",
                  onClick: () => window.location.assign("/projects"),
                },
                {
                  label: "GitHub",
                  href: "https://github.com/duyet",
                },
              ]}
            />
            <WorkBento />
          </Reveal>
        </section>

        {/* blog */}
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]">
          <Reveal>
            <SecHead
              num="02"
              eyebrow="Writing"
              title="From the blog"
              links={[
                {
                  label: "Browse the blog",
                  href: "https://blog.duyet.net",
                },
              ]}
            />
            <BlogTeaser />
          </Reveal>
        </section>

        {/* now band */}
        <section
          className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]"
        >
          <Reveal>
            <div
              className="rd-card p-[clamp(18px,2.2vw,26px)] relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 overflow-hidden"
            >
              <NowDeco />
              <div className="relative">
                <Eyebrow>
                  <span
                    className="rd-dot rd-ok rd-pulse inline-block"
                  />{" "}
                  NOW
                </Eyebrow>
                <p
                  className="mt-[14px] max-w-[42ch] text-[clamp(1.15rem,2vw,1.5rem)] tracking-[-0.02em] leading-[1.35]"
                >
                  Building agent workflows and the data platform underneath them
                  — writing, open-sourcing, and letting{" "}
                  <Link to="/about-duyetbot" className="rd-ulink">
                    @duyetbot
                  </Link>{" "}
                  keep the rest running.
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  to="/about"
                  className="relative cursor-pointer no-underline"
                >
                  About me <ArrowUpRight size={16} />
                </Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// SignalBar — 4 KPI tiles
// ---------------------------------------------------------------------------

function SignalBar() {
  const h = homelabSummary;
  const tiles = [
    {
      k: "Writing",
      big: String(totalPosts),
      unit: "posts",
      sub: `${yearsWriting} years, since ${sinceYear}`,
      to: "https://blog.duyet.net",
    },
    {
      k: "Shipping",
      big: String(apps.length),
      unit: "projects",
      sub: `${siblingApps.length} live apps`,
      to: "/projects",
    },
    {
      k: "Token burn",
      big: "1.24",
      unit: "B",
      sub: "all-time agent burn",
      flame: true,
      to: "/about",
    },
    {
      k: "Cluster",
      big: `${h.nodesOnline}/${h.nodesTotal}`,
      unit: "online",
      sub: `${h.services} services · ${h.avgCpu}% CPU`,
      live: true,
      to: "https://homelab.duyet.net",
    },
    {
      k: "Coding",
      big: "326",
      unit: "h/30d",
      sub: "11h avg / active day",
      spark: codingSparkline,
      to: "https://insights.duyet.net",
    },
  ];

  return (
    <div className="signalbar">
      {tiles.map((t) => {
        const isExternal = t.to.startsWith("http");
        const Component = isExternal ? "a" : Link;
        const linkProps = isExternal
          ? { href: t.to, target: "_blank", rel: "noreferrer" }
          : { to: t.to };

        return (
          <Component
            key={t.k}
            {...linkProps}
            className="signal-tile flex min-w-0 cursor-pointer flex-col gap-2 border-none bg-[var(--rd-surface)] p-[18px_20px] text-left text-inherit no-underline"
          >
            <div
              className="rd-eyebrow flex items-center gap-1.5 text-[10.5px]"
            >
              {t.live && (
                <span
                  className="rd-dot rd-ok rd-pulse inline-block"
                />
              )}
              {t.flame && (
                <span className="inline-flex text-[var(--rd-accent)]">
                  <Flame size={12} fill="var(--rd-accent)" />
                </span>
              )}
              {t.k}
            </div>
            <div className={cn("text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.9rem]", t.flame && "text-[var(--rd-accent-ink)]")}>
              {t.big}
              <span className="rd-unit">{t.unit}</span>
            </div>
            {t.spark ? (
              <Sparkline data={t.spark} h={22} />
            ) : (
              <div className="h-[22px]" />
            )}
            <div
              className="font-[var(--font-mono)] text-[var(--rd-text-3)] overflow-hidden text-ellipsis whitespace-nowrap text-[11px]"
            >
              {t.sub}
            </div>
          </Component>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WorkBento — 3-column selected work grid
// ---------------------------------------------------------------------------

function WorkBento() {
  return (
    <div className="rd-work-grid">
      {selectedProjects.map(({ item, tag }) => {
        const href = addUtmParams(
          item.href,
          "homepage",
          item.utmContent,
          item.host,
        );
        return (
          <a
            key={item.name}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="rd-card flex flex-col p-5 min-h-[176px] no-underline text-inherit"
          >
            <div className="flex items-center justify-between gap-2.5">
              <span className="font-[var(--font-mono)] rd-work-dom">
                {item.domain || item.host}
              </span>
            </div>
            <h3 className="text-[1.18rem] tracking-[-0.03em] mt-[15px]">{item.name}</h3>
            <p className="rd-work-desc">{item.description}</p>
            <div className="flex items-center justify-between mt-4">
              <Badge variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{tag}</Badge>
              <span className="text-[var(--rd-text-4)]">
                <ArrowUpRight size={15} />
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BlogTeaser — featured post with terminal block + recent posts list
// ---------------------------------------------------------------------------

function BlogTeaser() {
  if (!featuredPost) return null;

  const featuredCode = "npm i agents";

  return (
    <div
      className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] items-stretch gap-[18px]"
    >
      {/* featured post card */}
      <a
        className="rd-card flex cursor-pointer flex-col overflow-hidden no-underline text-inherit"
        href={`https://blog.duyet.net${featuredPost.slug}`}
        target="_blank"
        rel="noreferrer"
      >
        <div className="rd-termblock p-[26px_26px_30px]">
          <div className="flex gap-[7px]">
            <i />
            <i />
            <i />
          </div>
          <div
            className="font-[var(--font-mono)] mt-5 text-[22px] text-[var(--rd-accent)]"
          >
            <span className="opacity-60">$</span> {featuredCode}
            <span className="rd-caret" />
          </div>
        </div>
        <div className="p-[20px_26px_24px]">
          <div
            className="flex items-center gap-[10px] mb-3"
          >
            <Badge variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">
              {featuredPost.category}
            </Badge>
            <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
              {formatBlogDate(featuredPost.date)} · {featuredPost.readingTime}{" "}
              min
            </span>
          </div>
          <h3
            className="text-[1.5rem] tracking-[-0.03em]"
          >
            {featuredPost.title}
          </h3>
          {featuredPost.excerpt && (
            <p
              className="text-[var(--rd-text-2)] mt-[10px] text-[14.5px]"
            >
              {featuredPost.excerpt}
            </p>
          )}
        </div>
      </a>

      {/* recent posts list */}
      <Card className="p-0 border-0">
        <div className="rd-rows border-t-0">
          {recentPosts.slice(0, 5).map((post) => (
            <a
              key={post.slug}
              className="rd-row cursor-pointer grid-cols-[1fr_auto] p-[15px_8px] no-underline text-inherit"
              href={`https://blog.duyet.net${post.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <div className="min-w-0">
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-[550]"
                >
                  {post.title}
                </div>
                <div
                  className="font-[var(--font-mono)] text-[var(--rd-text-3)] mt-1 text-[11.5px]"
                >
                  {post.category} · {formatBlogDate(post.date)}
                </div>
                {post.excerpt && (
                  <div
                    className="text-[var(--rd-text-2)] mt-[5px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px]"
                  >
                    {post.excerpt}
                  </div>
                )}
              </div>
              <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
                {post.readingTime} min
              </span>
            </a>
          ))}
        </div>
        <Button variant="link" size="sm" asChild className="inline-flex ml-[22px] mt-1.5 mb-[14px]">
          <a
            href="https://blog.duyet.net"
            target="_blank"
            rel="noreferrer"
          >
            Browse all {totalPosts} posts &rarr;
          </a>
        </Button>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HeroDiagram — "Data Gravity Well" — concentric rings by category
// ---------------------------------------------------------------------------

function HeroDiagram() {
  const cx = 260, cy = 220;

  // Nodes grouped by category at different orbital distances
  const nodes = [
    // AI — inner orbit (r≈82)
    { t: "Claude", kind: "ai", slug: "anthropic", a: 310, orbit: 78 },
    { t: "LangGraph", kind: "ai", slug: "langchain", a: 215, orbit: 82 },
    { t: "AI SDK", kind: "ai", slug: "vercel", a: 130, orbit: 80 },
    { t: "OpenCode", kind: "ai", slug: "opencode", a: 40, orbit: 85 },
    // Data — middle orbit (r≈140)
    { t: "ClickHouse", kind: "data", slug: "clickhouse", lc: "C28800", a: 190, orbit: 142 },
    { t: "DuckDB", kind: "data", slug: "duckdb", a: 260, orbit: 138 },
    { t: "Kafka", kind: "data", slug: "apachekafka", lc: "231F20", a: 325, orbit: 140 },
    { t: "Airflow", kind: "data", slug: "apacheairflow", a: 20, orbit: 138 },
    { t: "Spark", kind: "data", slug: "apachespark", a: 130, orbit: 136 },
    // Infra — outer orbit (r≈190)
    { t: "Kubernetes", kind: "infra", slug: "kubernetes", a: 95, orbit: 190 },
    { t: "Cloudflare", kind: "infra", slug: "cloudflare", a: 25, orbit: 188 },
    { t: "Workers", kind: "infra", slug: "cloudflareworkers", a: 160, orbit: 190 },
  ];

  const kindColor = { ai: "var(--rd-accent)", data: "var(--rd-text)", infra: "var(--rd-text-3)" };
  const kindOp = { ai: 0.85, data: 0.5, infra: 0.35 };
  const _lite = (n: any) => `https://cdn.simpleicons.org/${n.slug}${n.lc ? `/${n.lc}` : ""}`;
  const _dark = (n: any) => `https://cdn.simpleicons.org/${n.slug}/${n.dc || "f0f0f0"}`;

  const pos = (a: number, r: number) => {
    const rad = (a * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
  };

  // Curved bezier path from node to core
  const curvePath = (a: number, orbit: number) => {
    const [px, py] = pos(a, orbit);
    const midR = orbit * 0.5;
    const rad = (a * Math.PI) / 180;
    const offset = 18;
    const cpx = cx + midR * Math.cos(rad) + offset * Math.sin(rad);
    const cpy = cy + midR * Math.sin(rad) - offset * Math.cos(rad);
    return `M ${px} ${py} Q ${cpx} ${cpy} ${cx} ${cy}`;
  };

  return (
    <div className="rd-hero-art" aria-hidden="true">
      <svg viewBox="0 0 520 440" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="hd-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--rd-accent)" stopOpacity="0.18" />
            <stop offset="50%" stopColor="var(--rd-accent)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="var(--rd-accent)" stopOpacity="0" />
          </radialGradient>
          <style>{`.hd-id{display:none}.dark .hd-id{display:inline}.dark .hd-il{display:none}`}</style>
        </defs>

        {/* Background glow */}
        <circle cx={cx} cy={cy} r="200" fill="url(#hd-glow)" />

        {/* Orbit guides */}
        <circle cx={cx} cy={cy} r="82" fill="none" stroke="var(--rd-border-2)" strokeWidth="0.6" strokeDasharray="2 6" opacity="0.5" />
        <circle cx={cx} cy={cy} r="140" fill="none" stroke="var(--rd-border-2)" strokeWidth="0.6" strokeDasharray="2 6" opacity="0.4" />
        <circle cx={cx} cy={cy} r="190" fill="none" stroke="var(--rd-border-2)" strokeWidth="0.6" strokeDasharray="2 6" opacity="0.3" />

        {/* Orbit ring labels */}
        <text x={cx + 82 + 6} y={cy - 4} className="font-[var(--font-mono)]" style={{ fontSize: 7.5, fill: "var(--rd-accent-ink)", opacity: 0.5, letterSpacing: "0.08em" }}>AI</text>
        <text x={cx + 140 + 6} y={cy - 4} className="font-[var(--font-mono)]" style={{ fontSize: 7.5, fill: "var(--rd-text-3)", opacity: 0.4, letterSpacing: "0.08em" }}>DATA</text>
        <text x={cx + 190 + 6} y={cy - 4} className="font-[var(--font-mono)]" style={{ fontSize: 7.5, fill: "var(--rd-text-3)", opacity: 0.3, letterSpacing: "0.08em" }}>INFRA</text>

        {/* Curved connections */}
        {nodes.map((n, i) => {
          const path = curvePath(n.a, n.orbit);
          return (
            <g key={`c${i}`}>
              <path d={path} fill="none" stroke="var(--rd-border-2)" strokeWidth="0.8" />
              <path
                d={path}
                fill="none"
                stroke={kindColor[n.kind as keyof typeof kindColor]}
                strokeWidth="1.2"
                strokeDasharray="2 8"
                className="rd-flow"
                style={{ animationDelay: `${i * 0.14}s`, opacity: kindOp[n.kind as keyof typeof kindOp] }}
              />
            </g>
          );
        })}

        {/* Tech pills with logos */}
        {nodes.map((n, i) => {
          const [px, py] = pos(n.a, n.orbit);
          const w = n.t.length * 6.5 + 40, h = 24;
          const x0 = px - w / 2;
          return (
            <g key={`p${i}`}>
              <rect x={x0} y={py - h / 2} width={w} height={h} rx="12" fill="var(--rd-surface)" stroke="var(--rd-border-2)" strokeWidth="1.1" />
              <image href={_lite(n)} x={x0 + 7} y={py - 5} width={10} height={10} className="hd-il" />
              <image href={_dark(n)} x={x0 + 7} y={py - 5} width={10} height={10} className="hd-id" />
              <text
                x={x0 + 21}
                y={py + 3.5}
                className="rd-chip"
                style={{ fontSize: 10.5, fontVariantNumeric: "tabular-nums", fill: n.kind === "ai" ? "var(--rd-accent-ink)" : "var(--rd-text-2)" }}
              >
                {n.t}
              </text>
            </g>
          );
        })}

        {/* Agent core (visual only, no label) */}
        <circle cx={cx} cy={cy} r="36" fill="none" stroke="var(--rd-accent)" strokeWidth="1.3" className="rd-hd-ring" />
        <circle cx={cx} cy={cy} r="25" fill="var(--rd-accent)" />
        <line x1={cx - 7} y1={cy} x2={cx + 7} y2={cy} stroke="#fff" strokeWidth="0.8" opacity="0.5" />
        <line x1={cx} y1={cy - 7} x2={cx} y2={cy + 7} stroke="#fff" strokeWidth="0.8" opacity="0.5" />
        <circle cx={cx} cy={cy} r="10" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.85" />
        <circle cx={cx} cy={cy} r="3" fill="#fff" className="rd-hd-pulse" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NowDeco — decorative SVG circles for NOW band
// ---------------------------------------------------------------------------

function NowDeco() {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className="pointer-events-none absolute -right-5 -top-[30px] h-[180px] w-[180px] opacity-45"
    >
      <circle
        cx="160"
        cy="40"
        r="70"
        fill="none"
        stroke="var(--rd-border)"
        strokeWidth="1"
      />
      <circle
        cx="160"
        cy="40"
        r="46"
        fill="none"
        stroke="var(--rd-border)"
        strokeWidth="1"
      />
      <circle
        cx="160"
        cy="40"
        r="22"
        fill="none"
        stroke="var(--rd-accent)"
        strokeWidth="1.4"
        strokeDasharray="3 5"
        className="rd-flow"
      />
      <circle cx="160" cy="40" r="5" fill="var(--rd-accent)" className="rd-hd-pulse" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBlogDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

