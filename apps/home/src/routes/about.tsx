import { ArrowUpRight, Bot, Code, Database, Server, Flame } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Eyebrow,
  Reveal,
  SecHead,
} from "@duyet/components";
import { DEFAULT_AREAS } from "@duyet/components";
import { addUtmParams } from "../../app/lib/utm";

const experienceYears = "8+ years";
const contentLastModified = "2026-05-02";

const profilePageJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  dateCreated: "2020-01-01",
  dateModified: contentLastModified,
  mainEntity: {
    "@type": "Person",
    name: "Duyet Le",
    jobTitle: "Senior Data & AI Engineer",
    email: "me@duyet.net",
    url: "https://duyet.net",
    sameAs: [
      "https://github.com/duyet",
      "https://linkedin.com/in/duyet",
      "https://blog.duyet.net",
    ],
    description: `Senior Data & AI Engineer with ${experienceYears} of experience building scalable data infrastructure, AI/ML platforms, and distributed systems. Expertise in modern data warehousing, real-time processing, and cloud-native architectures.`,
    knowsAbout: [
      "Data Engineering",
      "AI/ML Infrastructure",
      "Platform Engineering",
      "LlamaIndex",
      "AI SDK",
      "LangGraph",
      "ClickHouse",
      "Apache Spark",
      "Apache Airflow",
      "Python",
      "Rust",
      "TypeScript",
      "Kubernetes",
      "AWS",
      "GCP",
      "Kafka",
      "BigQuery",
      "Helm",
      "Distributed Systems",
      "Cloud Computing",
      "Data Warehousing",
      "Machine Learning Infrastructure",
      "DevOps",
    ],
    worksFor: {
      "@type": "Organization",
      name: "Cartrack",
      url: "https://cartrack.us",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Information Technology",
    },
  },
});

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Duyet | Senior Data & AI Engineer" },
      {
        name: "description",
        content: `Senior Data & AI Engineer with ${experienceYears} of experience building scalable data infrastructure, AI/ML platforms, and distributed systems.`,
      },
    ],
    links: [{ rel: "canonical", href: "https://duyet.net/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: profilePageJsonLd,
      },
    ],
  }),
});

const facts = [
  { label: "Role", value: "Senior Data & AI Engineer" },
  { label: "Experience", value: experienceYears },
  { label: "Based in", value: "Ho Chi Minh City" },
  { label: "Now", value: "Cartrack" },
];

const focus =
  "Data pipelines, warehouses, and observability. Agent workflows, model routing, evaluation, and usage analytics. Small, sharp tools with clean interfaces.";

const stack =
  "Python, Rust, TypeScript · Spark, Airflow, ClickHouse, BigQuery, Kafka · Kubernetes, AWS, GCP, Cloudflare · LlamaIndex, AI SDK, LangGraph.";

const elsewhere = [
  {
    title: "Résumé",
    description: "Roles, references, and the long-form story.",
    url: addUtmParams("https://cv.duyet.net", "about_page", "resume_card"),
  },
  {
    title: "GitHub",
    description: "Open source across Python, Rust, and TypeScript.",
    url: addUtmParams(
      "https://github.com/duyet",
      "about_page",
      "github_card",
    ),
  },
  {
    title: "LinkedIn",
    description: "Professional history and career context.",
    url: addUtmParams(
      "https://linkedin.com/in/duyet",
      "about_page",
      "linkedin_card",
    ),
  },
  {
    title: "Blog",
    description: "Writing on data engineering, AI, and OSS.",
    url: addUtmParams("https://blog.duyet.net", "about_page", "blog_card"),
  },
];

// Expertise areas derived from DEFAULT_AREAS, mapped to the design's card shape.
const expertise = DEFAULT_AREAS.map((a) => ({
  area: a.title,
  yr: `${a.years} yr`,
  desc: a.description,
  tools: a.tags,
}));

const agentsList = [
  {
    name: "Claude Code",
    role: "Architecture & review",
    desc: "My default pair — reads the whole tree, reasons about design, and writes the load-bearing code.",
  },
  {
    name: "Codex",
    role: "Long-horizon refactors",
    desc: "Hand it a goal and a repo; it plans, edits across files, and runs the tests until green.",
  },
  {
    name: "opencode",
    role: "Local & offline",
    desc: "Open-source TUI agent wired to homelab models for quick, private edits without the cloud.",
  },
];

const techStack = [
  {
    g: "Languages",
    icon: "code",
    items: ["Python", "Rust", "TypeScript", "SQL"],
  },
  {
    g: "Data",
    icon: "disk",
    items: ["ClickHouse", "Spark", "Airflow", "BigQuery", "Kafka", "dbt", "DuckDB"],
  },
  {
    g: "Cloud & Infra",
    icon: "server",
    items: ["Kubernetes", "AWS", "GCP", "Cloudflare", "Terraform"],
  },
  {
    g: "AI & Agents",
    icon: "bot",
    items: ["LangGraph", "LlamaIndex", "AI SDK", "Claude API"],
  },
];

function StackGroupIcon({ icon }: { icon: string }) {
  const size = 18;
  if (icon === "code") return <Code size={size} />;
  if (icon === "server") return <Server size={size} />;
  if (icon === "bot") return <Bot size={size} />;
  // disk / default
  return <Database size={size} />;
}

function AboutPage() {
  return (
    <div
      className="page-enter"
      style={{
        background: "var(--rd-bg)",
        color: "var(--rd-text)",
      }}
    >
      <div
        className="rd-wrap"
        style={{
          paddingTop: "clamp(40px,5vw,64px)",
          paddingBottom: "clamp(56px,8vw,96px)",
        }}
      >
        {/* Intro block */}
        <div className="rd-card rd-card-pad" style={{ padding: "clamp(28px,4vw,52px)" }}>
          <Eyebrow>About</Eyebrow>
          <h1
            style={{
              fontSize: "clamp(2rem,4.4vw,3.3rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.04,
              marginTop: 18,
              maxWidth: "18ch",
            }}
          >
            I build data platforms, and the AI agents that run on top of them.
          </h1>
          <p
            className="rd-lead"
            style={{
              marginTop: 24,
              maxWidth: "60ch",
              fontSize: "clamp(1.05rem,1.5vw,1.22rem)",
            }}
          >
            I care about systems that are easy to operate, easy to explain, and
            boring in the places where reliability matters. Most of my work sits
            where data products, AI tooling, and engineering platforms meet —
            and most of it ends up open source.
          </p>
          <div className="rd-g4" style={{ marginTop: 34, gap: 10 }}>
            {facts.map((f) => (
              <div
                key={f.label}
                className="rd-card rd-card-pad"
                style={{ background: "var(--rd-bg-sub)", padding: "16px 18px" }}
              >
                <div className="rd-eyebrow" style={{ fontSize: 10 }}>
                  {f.label}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    marginTop: 8,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vibe-coding bento + agents */}
        <div className="rd-vibe-bento" style={{ marginTop: 12 }}>
          {/* Left: vibe-coding lead card */}
          <div className="rd-card rd-vibe-lead">
            <div className="rd-vibe-badge">
              <Flame size={12} />
              Deep in vibe-coding mode
            </div>
            <p
              style={{
                marginTop: 20,
                fontSize: "clamp(0.95rem,1.3vw,1.08rem)",
                lineHeight: 1.6,
                color: "var(--rd-text-2)",
                maxWidth: "40ch",
              }}
            >
              These days most of what ships here is written alongside coding
              agents, with me steering. I describe intent, review diffs, and
              keep the architecture honest — the agents do the typing, the
              searching, and a lot of the grunt work.
            </p>
            <div className="rd-vibe-stat">
              <div className="rd-bigstat">
                1.24<span className="rd-unit">B</span>
              </div>
              <span className="rd-mono rd-dim" style={{ fontSize: 12 }}>
                tokens burned all-time
              </span>
            </div>
          </div>

          {/* Right: agent cards */}
          <div className="rd-vibe-agents">
            {agentsList.map((agent) => (
              <div key={agent.name} className="rd-card rd-agent-card">
                <div className="rd-ac-top">
                  <div className="rd-ac-ic">
                    <Bot size={15} />
                  </div>
                  <span className="rd-ac-name">{agent.name}</span>
                  <span className="rd-ac-role">{agent.role}</span>
                </div>
                <p className="rd-ac-desc">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Focus + Stack */}
        <div className="rd-g2" style={{ marginTop: 12 }}>
          <div
            className="rd-card rd-card-pad"
            style={{ padding: "clamp(24px,3vw,34px)" }}
          >
            <Eyebrow>Focus</Eyebrow>
            <p
              style={{
                fontSize: "clamp(1.05rem,1.6vw,1.3rem)",
                lineHeight: 1.5,
                letterSpacing: "-0.01em",
                marginTop: 16,
                maxWidth: "34ch",
                color: "var(--rd-text-2)",
              }}
            >
              {focus}
            </p>
          </div>
          <div
            className="rd-card rd-card-pad"
            style={{ padding: "clamp(24px,3vw,34px)" }}
          >
            <Eyebrow>Stack</Eyebrow>
            <p
              style={{
                fontSize: "clamp(1.05rem,1.6vw,1.3rem)",
                lineHeight: 1.5,
                letterSpacing: "-0.01em",
                marginTop: 16,
                color: "var(--rd-text-2)",
              }}
            >
              {stack}
            </p>
          </div>
        </div>

        {/* Tech stack groups */}
        <div className="rd-g4" style={{ marginTop: 12, gap: 10 }}>
          {techStack.map((group) => (
            <div
              key={group.g}
              className="rd-card rd-card-hover rd-card-pad"
              style={{ padding: "20px 22px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div className="rd-stack-ic">
                  <StackGroupIcon icon={group.icon} />
                </div>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {group.g}
                </span>
              </div>
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
              >
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rd-chip rd-mono"
                    style={{ fontSize: 11.5 }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Elsewhere */}
        <div
          className="rd-card rd-card-pad"
          style={{ marginTop: 12, padding: "clamp(24px,3vw,34px)" }}
        >
          <Eyebrow>Elsewhere</Eyebrow>
          <div className="rd-g4" style={{ marginTop: 18, gap: 10 }}>
            {elsewhere.map((e) => (
              <a
                key={e.title}
                className="rd-card rd-card-hover rd-card-pad"
                href={e.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "var(--rd-bg-sub)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minHeight: 120,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 16 }}>
                    {e.title}
                  </span>
                  <span className="rd-rowarrow">
                    <ArrowUpRight size={15} />
                  </span>
                </div>
                <p
                  className="rd-muted"
                  style={{ fontSize: 13.5, lineHeight: 1.5 }}
                >
                  {e.description}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Expertise */}
        <div style={{ marginTop: "clamp(48px,6vw,72px)" }}>
          <SecHead
            eyebrow="Capabilities"
            title="Areas of expertise"
            links={[{ label: "See projects", href: "/projects" }]}
          />
          <p
            className="rd-muted"
            style={{
              marginTop: -16,
              marginBottom: 26,
              maxWidth: "52ch",
            }}
          >
            {experienceYears} of delivery across data, AI, and platform
            engineering — here's where the time actually went.
          </p>
          <div className="rd-g2" style={{ gap: 12 }}>
            {expertise.map((e, i) => (
              <Reveal
                key={e.area}
                delay={i * 50}
                className="rd-card rd-card-pad"
                style={{
                  padding: "clamp(22px,2.6vw,30px)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.35rem",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {e.area}
                  </h3>
                  <span
                    className="rd-mono rd-dim"
                    style={{ fontSize: 12.5 }}
                  >
                    {e.yr}
                  </span>
                </div>
                <p
                  className="rd-muted"
                  style={{
                    marginTop: 12,
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    flex: 1,
                  }}
                >
                  {e.desc}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 7,
                    marginTop: 18,
                  }}
                >
                  {e.tools.map((t) => (
                    <span key={t} className="rd-chip" style={{ fontSize: 12 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
