import { ArrowUpRight } from "lucide-react";
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
const totalApps = siblingApps.length + 1; // +1 for home itself

// Hand-picked to show breadth: AI infra, data, agents, DevOps, craft, type.
const SELECTED: { name: string; tag: string }[] = [
  { name: "AnyRouter", tag: "AI Infra" },
  { name: "ClickHouse Monitoring", tag: "Data" },
  { name: "AI Agents", tag: "AI" },
  { name: "Stamps", tag: "Tool" },
  { name: "Helm Charts", tag: "Infra" },
  { name: "Duyet Serif", tag: "Type" },
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
                <Eyebrow>DATA &amp; AI ENGINEER &nbsp;·&nbsp; HO CHI MINH CITY</Eyebrow>
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
    },
    {
      k: "Shipping",
      big: String(apps.length),
      unit: "projects",
      sub: `${totalApps} live apps`,
    },
    {
      k: "Cluster",
      big: `${h.nodesOnline}/${h.nodesTotal}`,
      unit: "online",
      sub: `${h.services} services · ${h.avgCpu}% CPU`,
      live: true,
    },
    {
      k: "Coding",
      big: "326",
      unit: "h/30d",
      sub: "11h avg / active day",
      spark: codingSparkline,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 0,
        border: "1px solid var(--rd-border)",
        borderRadius: "var(--rd-r)",
        overflow: "hidden",
      }}
    >
      {tiles.map((t, i) => (
        <div
          key={t.k}
          style={{
            textAlign: "left",
            background: "var(--rd-surface)",
            border: "none",
            borderRight:
              i < 3 ? "1px solid var(--rd-border)" : "none",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 0,
          }}
        >
          <div
            className="rd-eyebrow"
            style={{ fontSize: 10.5 }}
          >
            {t.live && (
              <span
                className="rd-dot rd-ok rd-pulse"
                style={{ display: "inline-block" }}
              />
            )}{" "}
            {t.k}
          </div>
          <div className="rd-bigstat" style={{ fontSize: "1.9rem" }}>
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
        </div>
      ))}
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
  return (
    <div className="rd-hero-art" aria-hidden="true">
      <svg viewBox="0 0 384 360" preserveAspectRatio="xMidYMid meet">
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
          width="384"
          height="360"
          fill="url(#hd-dots)"
          opacity="0.5"
        />

        {/* vertical data bus */}
        <line
          x1="192"
          y1="280"
          x2="192"
          y2="132"
          stroke="var(--rd-border-2)"
          strokeWidth="1.4"
        />
        <line
          x1="192"
          y1="280"
          x2="192"
          y2="132"
          stroke="var(--rd-accent)"
          strokeWidth="1.6"
          strokeDasharray="2 7"
          className="rd-flow"
        />

        {/* orbit + satellites */}
        <ellipse
          cx="192"
          cy="104"
          rx="98"
          ry="30"
          fill="none"
          stroke="var(--rd-border-2)"
          strokeWidth="1.2"
          strokeDasharray="3 6"
          className="rd-orbit"
        />
        <g stroke="var(--rd-border-2)" strokeWidth="1.1">
          <line x1="94" y1="104" x2="168" y2="104" />
          <line x1="290" y1="104" x2="216" y2="104" />
        </g>
        <circle
          cx="94"
          cy="104"
          r="7"
          fill="var(--rd-surface)"
          stroke="var(--rd-text-3)"
          strokeWidth="1.3"
        />
        <circle
          cx="290"
          cy="104"
          r="7"
          fill="var(--rd-surface)"
          stroke="var(--rd-text-3)"
          strokeWidth="1.3"
        />

        {/* agent core */}
        <circle
          cx="192"
          cy="104"
          r="30"
          fill="none"
          stroke="var(--rd-accent)"
          strokeWidth="1.3"
          className="rd-hd-ring"
        />
        <circle cx="192" cy="104" r="23" fill="var(--rd-accent)" />
        <circle
          cx="192"
          cy="104"
          r="8.5"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          opacity="0.95"
        />
        <circle cx="192" cy="104" r="2.6" fill="#fff" className="rd-hd-pulse" />

        {/* processing node */}
        <g transform="rotate(45 192 200)">
          <rect
            x="181"
            y="189"
            width="22"
            height="22"
            rx="4"
            fill="var(--rd-surface)"
            stroke="var(--rd-text)"
            strokeWidth="1.4"
          />
        </g>
        <circle
          cx="192"
          cy="200"
          r="3.4"
          fill="var(--rd-accent)"
          className="rd-hd-pulse"
        />

        {/* data platform cylinder */}
        <g fill="var(--rd-surface)" stroke="var(--rd-text-3)" strokeWidth="1.3">
          <path d="M138 282 V322 A54 13 0 0 0 246 322 V282" />
          <ellipse cx="192" cy="282" rx="54" ry="13" />
        </g>
        <path
          d="M138 302 A54 13 0 0 0 246 302"
          fill="none"
          stroke="var(--rd-border-2)"
          strokeWidth="1.1"
        />

        {/* labels */}
        <text
          x="192"
          y="48"
          textAnchor="middle"
          className="rd-mono"
          style={{ fontSize: 11, fill: "var(--rd-accent)", letterSpacing: "0.06em" }}
        >
          agent
        </text>
        <text
          x="94"
          y="129"
          textAnchor="middle"
          className="rd-mono"
          style={{ fontSize: 10, fill: "var(--rd-text-3)" }}
        >
          tools
        </text>
        <text
          x="290"
          y="129"
          textAnchor="middle"
          className="rd-mono"
          style={{ fontSize: 10, fill: "var(--rd-text-3)" }}
        >
          models
        </text>
        <text
          x="214"
          y="204"
          className="rd-mono"
          style={{ fontSize: 10, fill: "var(--rd-text-3)" }}
        >
          router
        </text>
        <text
          x="192"
          y="347"
          textAnchor="middle"
          className="rd-mono"
          style={{ fontSize: 10, fill: "var(--rd-text-3)" }}
        >
          data platform
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

