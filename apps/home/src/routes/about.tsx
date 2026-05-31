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
    <div className="page-enter bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="rd-wrap pt-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]">
        {/* Intro block */}
        <div className="rd-card rd-card-pad p-[clamp(28px,4vw,52px)]">
          <Eyebrow>About</Eyebrow>
          <h1 className="rd-display mt-[13px] max-w-[17ch] text-[clamp(2.05rem,4.2vw,3.3rem)] leading-[1.02]">
            I build data platforms, and the{" "}
            <span className="text-[var(--rd-accent)]">AI agents</span>{" "}
            that run on top of them.
          </h1>
          <p className="rd-lead mt-6 max-w-[60ch] text-[clamp(1.05rem,1.5vw,1.22rem)]">
            I care about systems that are easy to operate, easy to explain, and
            boring in the places where reliability matters. Most of my work sits
            where data products, AI tooling, and engineering platforms meet —
            and most of it ends up open source.
          </p>
          <div className="rd-g4 mt-[34px] gap-[10px]">
            {facts.map((f) => (
              <div
                key={f.label}
                className="rd-card rd-card-pad bg-[var(--rd-bg-sub)] px-[18px] py-4"
              >
                <div className="rd-eyebrow text-[10px]">
                  {f.label}
                </div>
                <div className="mt-2 text-[16px] font-semibold tracking-[-0.02em]">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vibe-coding bento + agents */}
        <div className="rd-vibe-bento mt-3">
          {/* Left: vibe-coding lead card */}
          <div className="rd-card rd-vibe-lead">
            <div className="rd-vibe-badge">
              <Flame size={12} />
              Deep in vibe-coding mode
            </div>
            <p className="mt-5 max-w-[40ch] text-[clamp(0.95rem,1.3vw,1.08rem)] leading-[1.6] text-[var(--rd-text-2)]">
              These days most of what ships here is written alongside coding
              agents, with me steering. I describe intent, review diffs, and
              keep the architecture honest — the agents do the typing, the
              searching, and a lot of the grunt work.
            </p>
            <div className="rd-vibe-stat">
              <div className="rd-bigstat">
                1.24<span className="rd-unit">B</span>
              </div>
              <span className="rd-mono rd-dim text-xs">
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
        <div className="rd-g2 mt-3">
          <div className="rd-card rd-card-pad p-[clamp(24px,3vw,34px)]">
            <Eyebrow>Focus</Eyebrow>
            <p className="mt-4 max-w-[34ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.5] tracking-[-0.01em] text-[var(--rd-text-2)]">
              {focus}
            </p>
          </div>
          <div className="rd-card rd-card-pad p-[clamp(24px,3vw,34px)]">
            <Eyebrow>Stack</Eyebrow>
            <p className="mt-4 text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.5] tracking-[-0.01em] text-[var(--rd-text-2)]">
              {stack}
            </p>
          </div>
        </div>

        {/* Tech stack groups */}
        <div className="rd-g4 mt-3 gap-[10px]">
          {techStack.map((group) => (
            <div
              key={group.g}
              className="rd-card rd-card-hover rd-card-pad px-[22px] py-5"
            >
              <div className="mb-[14px] flex items-center gap-[10px]">
                <div className="rd-stack-ic">
                  <StackGroupIcon icon={group.icon} />
                </div>
                <span className="text-[14px] font-semibold tracking-[-0.01em]">
                  {group.g}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rd-chip rd-mono text-[11.5px]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Elsewhere */}
        <div className="rd-card rd-card-pad mt-3 p-[clamp(24px,3vw,34px)]">
          <Eyebrow>Elsewhere</Eyebrow>
          <div className="rd-g4 mt-[18px] gap-[10px]">
            {elsewhere.map((e) => (
              <a
                key={e.title}
                className="rd-card rd-card-hover rd-card-pad flex flex-col gap-2 bg-[var(--rd-bg-sub)] min-h-[120px] text-inherit no-underline"
                href={e.url}
                target="_blank"
                rel="noreferrer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-semibold">
                    {e.title}
                  </span>
                  <span className="rd-rowarrow">
                    <ArrowUpRight size={15} />
                  </span>
                </div>
                <p className="rd-muted text-[13.5px] leading-[1.5]">
                  {e.description}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Expertise */}
        <div className="mt-[clamp(48px,6vw,72px)]">
          <SecHead
            eyebrow="Capabilities"
            title="Areas of expertise"
            links={[{ label: "See projects", href: "/projects" }]}
          />
          <p className="rd-muted -mt-4 mb-[26px] max-w-[52ch]">
            {experienceYears} of delivery across data, AI, and platform
            engineering — here's where the time actually went.
          </p>
          <div className="rd-g2 gap-3">
            {expertise.map((e, i) => (
              <Reveal
                key={e.area}
                delay={i * 50}
                className="rd-card rd-card-pad flex flex-col p-[clamp(22px,2.6vw,30px)]"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[1.35rem] tracking-[-0.03em]">
                    {e.area}
                  </h3>
                  <span className="rd-mono rd-dim text-[12.5px]">
                    {e.yr}
                  </span>
                </div>
                <p className="rd-muted mt-3 flex-1 text-[14.5px] leading-[1.55]">
                  {e.desc}
                </p>
                <div className="mt-[18px] flex flex-wrap gap-[7px]">
                  {e.tools.map((t) => (
                    <span key={t} className="rd-chip text-xs">
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
