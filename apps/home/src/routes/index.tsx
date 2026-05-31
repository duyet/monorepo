import { ArrowUpRight, ArrowRight, Flame } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
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

      <div style={{ background: "var(--rd-bg)", color: "var(--rd-text)" }}>
        {/* hero */}
        <section
          className="rd-wrap"
          style={{
            paddingTop: "clamp(22px, 3.2vw, 40px)",
            paddingBottom: "clamp(26px, 3.5vw, 40px)",
          }}
        >
          <Reveal>
            <div className="rd-hero-grid">
              <div>
                <Eyebrow>DATA &amp; AI ENGINEER</Eyebrow>
                <h1
                  className="rd-display"
                  style={{
                    marginTop: 13,
                    maxWidth: "17ch",
                    fontSize: "clamp(2.05rem, 4.2vw, 3.3rem)",
                    lineHeight: 1.02,
                  }}
                >
                  I build data platforms, and the{" "}
                  <span style={{ color: "var(--rd-accent)" }}>AI agents</span>{" "}
                  that run on top of them.
                </h1>
                <p
                  className="rd-lead"
                  style={{
                    marginTop: 16,
                    maxWidth: "56ch",
                    fontSize: "clamp(0.96rem, 1.15vw, 1.06rem)",
                  }}
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
                  className="vibe-flag"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="vf-ic" style={{ display: "grid", placeItems: "center" }}>
                    <Flame size={13} fill="#fff" />
                  </span>
                  <span>
                    <strong>Deep in vibe-coding mode</strong> — most of what ships here is written alongside coding agents, with me steering.
                  </span>
                  <span className="vf-arr" style={{ display: "inline-flex" }}>
                    <ArrowRight size={14} />
                  </span>
                </Link>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginTop: 20,
                  }}
                >
                  <a
                    className="rd-btn rd-btn-primary"
                    href="https://blog.duyet.net"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read the blog
                  </a>
                  <a
                    className="rd-btn rd-btn-ghost"
                    href="https://cv.duyet.net"
                    target="_blank"
                    rel="noreferrer"
                  >
                    R&eacute;sum&eacute;
                  </a>
                  <a
                    className="rd-btn rd-btn-text"
                    href="https://github.com/duyet"
                    target="_blank"
                    rel="noreferrer"
                  >
                    github.com/duyet
                  </a>
                </div>
              </div>
              <HeroDiagram />
            </div>
          </Reveal>

          <Reveal delay={100} style={{ marginTop: "clamp(22px, 3vw, 36px)" }}>
            <SignalBar />
          </Reveal>
        </section>

        {/* selected work */}
        <section className="rd-wrap rd-section-tight">
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
        <section className="rd-wrap rd-section-tight">
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
          className="rd-wrap rd-section-tight"
          style={{ paddingBottom: "clamp(56px, 8vw, 96px)" }}
        >
          <Reveal>
            <div
              className="rd-card rd-card-pad"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 24,
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <NowDeco />
              <div style={{ position: "relative" }}>
                <Eyebrow>
                  <span
                    className="rd-dot rd-ok rd-pulse"
                    style={{ display: "inline-block" }}
                  />{" "}
                  NOW
                </Eyebrow>
                <p
                  style={{
                    fontSize: "clamp(1.15rem, 2vw, 1.5rem)",
                    letterSpacing: "-0.02em",
                    marginTop: 14,
                    maxWidth: "42ch",
                    lineHeight: 1.35,
                  }}
                >
                  Building agent workflows and the data platform underneath them
                  — writing, open-sourcing, and letting{" "}
                  <Link to="/about-duyetbot" className="rd-ulink">
                    @duyetbot
                  </Link>{" "}
                  keep the rest running.
                </p>
              </div>
              <Link
                to="/about"
                className="rd-btn rd-btn-ghost"
                style={{ cursor: "pointer", position: "relative" }}
              >
                About me <ArrowUpRight size={16} />
              </Link>
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
            className="signal-tile"
            style={{
              textDecoration: "none",
              color: "inherit",
              textAlign: "left",
              background: "var(--rd-surface)",
              border: "none",
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              minWidth: 0,
              cursor: "pointer",
            }}
          >
            <div
              className="rd-eyebrow"
              style={{ fontSize: 10.5, display: "flex", alignItems: "center", gap: 6 }}
            >
              {t.live && (
                <span
                  className="rd-dot rd-ok rd-pulse"
                  style={{ display: "inline-block" }}
                />
              )}
              {t.flame && (
                <span style={{ color: "var(--rd-accent)", display: "inline-flex" }}>
                  <Flame size={12} fill="var(--rd-accent)" />
                </span>
              )}
              {t.k}
            </div>
            <div className="rd-bigstat" style={{ fontSize: "1.9rem", color: t.flame ? "var(--rd-accent-ink)" : undefined }}>
              {t.big}
              <span className="rd-unit">{t.unit}</span>
            </div>
            {t.spark ? (
              <Sparkline data={t.spark} h={22} />
            ) : (
              <div style={{ height: 22 }} />
            )}
            <div
              className="rd-mono rd-dim"
              style={{
                fontSize: 11,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
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
            className="rd-card rd-card-hover rd-work-card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="rd-work-top">
              <span className="rd-mono rd-work-dom">
                {item.domain || item.host}
              </span>
            </div>
            <h3 className="rd-work-name">{item.name}</h3>
            <p className="rd-work-desc">{item.description}</p>
            <div className="rd-work-foot">
              <span className="rd-chip rd-mono rd-work-tag">{tag}</span>
              <span style={{ color: "var(--rd-text-4)" }}>
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
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, .95fr)",
        gap: 18,
        alignItems: "stretch",
      }}
    >
      {/* featured post card */}
      <a
        className="rd-card rd-card-hover"
        href={`https://blog.duyet.net${featuredPost.slug}`}
        target="_blank"
        rel="noreferrer"
        style={{
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div className="rd-termblock" style={{ padding: "26px 26px 30px" }}>
          <div className="rd-term-dots">
            <i />
            <i />
            <i />
          </div>
          <div
            className="rd-mono"
            style={{
              marginTop: 20,
              fontSize: 22,
              color: "var(--rd-accent)",
            }}
          >
            <span style={{ opacity: 0.6 }}>$</span> {featuredCode}
            <span className="rd-caret" />
          </div>
        </div>
        <div style={{ padding: "20px 26px 24px" }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span className="rd-chip rd-mono" style={{ fontSize: 10.5 }}>
              {featuredPost.category}
            </span>
            <span className="rd-mono rd-dim" style={{ fontSize: 12 }}>
              {formatBlogDate(featuredPost.date)} · {featuredPost.readingTime}{" "}
              min
            </span>
          </div>
          <h3
            style={{
              fontSize: "1.5rem",
              letterSpacing: "-0.03em",
            }}
          >
            {featuredPost.title}
          </h3>
          {featuredPost.excerpt && (
            <p
              className="rd-muted"
              style={{ marginTop: 10, fontSize: 14.5 }}
            >
              {featuredPost.excerpt}
            </p>
          )}
        </div>
      </a>

      {/* recent posts list */}
      <div className="rd-card" style={{ padding: "8px 22px" }}>
        <div className="rd-rows" style={{ borderTop: "none" }}>
          {recentPosts.slice(0, 5).map((post) => (
            <a
              key={post.slug}
              className="rd-row"
              href={`https://blog.duyet.net${post.slug}`}
              target="_blank"
              rel="noreferrer"
              style={{
                gridTemplateColumns: "1fr auto",
                cursor: "pointer",
                padding: "15px 0",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 550,
                    fontSize: 15,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {post.title}
                </div>
                <div
                  className="rd-mono rd-dim"
                  style={{ fontSize: 11.5, marginTop: 4 }}
                >
                  {post.category} · {formatBlogDate(post.date)}
                </div>
              </div>
              <span className="rd-mono rd-dim" style={{ fontSize: 12 }}>
                {post.readingTime} min
              </span>
            </a>
          ))}
        </div>
        <a
          className="rd-btn rd-btn-text"
          href="https://blog.duyet.net"
          target="_blank"
          rel="noreferrer"
          style={{ display: "inline-flex", marginTop: 6 }}
        >
          Browse all {totalPosts} posts &rarr;
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HeroDiagram — orbital agent schematic (inline SVG)
// ---------------------------------------------------------------------------

function HeroDiagram() {
  const cx = 210, cy = 188, rx = 150, ry = 122, core = 33;
  // tech ring — tools + models + data + infra, named
  const nodes = [
    { t: "LangGraph", a: 270, kind: "ai", slug: "langchain" },
    { t: "Claude", a: 318, kind: "ai", slug: "claude" },
    { t: "Kafka", a: 6, kind: "data", slug: "apachekafka", lc: "222222" },
    { t: "Cloudflare", a: 48, kind: "infra", slug: "cloudflare" },
    { t: "Kubernetes", a: 90, kind: "infra", slug: "kubernetes" },
    { t: "Airflow", a: 132, kind: "data", slug: "apacheairflow" },
    { t: "Spark", a: 174, kind: "data", slug: "apachespark" },
    { t: "ClickHouse", a: 222, kind: "data", slug: "clickhouse", lc: "C28800" },
  ];
  const pt = (a: number, fx = rx, fy = ry) => {
    const r = (a * Math.PI) / 180;
    return [cx + fx * Math.cos(r), cy + fy * Math.sin(r)];
  };
  const kindColor = { ai: "var(--rd-accent)", data: "var(--rd-text)", infra: "var(--rd-text-3)" };
  const lite = (n: any) => `https://cdn.simpleicons.org/${n.slug}${n.lc ? "/" + n.lc : ""}`;
  const dark = (n: any) => `https://cdn.simpleicons.org/${n.slug}/${n.dc || "f0f0f0"}`;

  return (
    <div className="rd-hero-art" aria-hidden="true">
      <svg viewBox="0 0 420 380" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern
            id="hd-dots"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.4" cy="1.4" r="1.3" fill="var(--rd-border-2)" />
          </pattern>
        </defs>
        <rect
          x="0"
          y="0"
          width="420"
          height="380"
          fill="url(#hd-dots)"
          opacity="0.45"
        />

        {/* connectors */}
        {nodes.map((n, i) => {
          const [px, py] = pt(n.a);
          const r = (n.a * Math.PI) / 180;
          const sx = cx + core * Math.cos(r), sy = cy + core * Math.sin(r);
          return (
            <g key={"c" + i}>
              <line x1={sx} y1={sy} x2={px} y2={py} stroke="var(--rd-border-2)" strokeWidth="1.2" />
              <line x1={sx} y1={sy} x2={px} y2={py} stroke="var(--rd-accent)" strokeWidth="1.4" strokeDasharray="2 8" className="rd-flow" style={{ animationDelay: `${i * 0.12}s`, opacity: n.kind === "ai" ? 0.9 : 0.45 }} />
              <circle cx={px} cy={py} r="2.6" fill={kindColor[n.kind as keyof typeof kindColor]} />
            </g>
          );
        })}

        {/* orbit guide */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="var(--rd-border-2)"
          strokeWidth="1"
          strokeDasharray="3 7"
          className="rd-orbit"
          opacity="0.6"
        />

        {/* tech pills */}
        {nodes.map((n, i) => {
          const [px, py] = pt(n.a);
          const w = n.t.length * 6.5 + 46, h = 26;
          const x0 = px - w / 2;
          return (
            <g key={"p" + i}>
              <rect x={x0} y={py - h / 2} width={w} height={h} rx="13" fill="var(--rd-surface)" stroke="var(--rd-border-2)" strokeWidth="1.1" />
              <image className="hd-logo-lite" href={lite(n)} x={x0 + 11} y={py - 7.5} width="15" height="15" />
              <image className="hd-logo-dark" href={dark(n)} x={x0 + 11} y={py - 7.5} width="15" height="15" />
              <text x={x0 + 33} y={py + 3.7} className="rd-chip" style={{ fontSize: 10.5, fontVariantNumeric: "tabular-nums", fill: n.kind === "ai" ? "var(--rd-accent-ink)" : "var(--rd-text-2)" }}>{n.t}</text>
            </g>
          );
        })}

        {/* agent core */}
        <circle
          cx={cx}
          cy={cy}
          r={core}
          fill="none"
          stroke="var(--rd-accent)"
          strokeWidth="1.3"
          className="rd-hd-ring"
        />
        <circle cx={cx} cy={cy} r="25" fill="var(--rd-accent)" />
        <circle
          cx={cx}
          cy={cy}
          r="9.5"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          opacity="0.95"
        />
        <circle cx={cx} cy={cy} r="3" fill="#fff" className="rd-hd-pulse" />
        <text
          x={cx}
          y={cy + 52}
          textAnchor="middle"
          className="rd-mono"
          style={{ fontSize: 9, fill: "var(--rd-accent-ink)", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          agent core
        </text>
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
      style={{
        position: "absolute",
        right: -20,
        top: -30,
        width: 180,
        height: 180,
        opacity: 0.45,
        pointerEvents: "none",
      }}
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

