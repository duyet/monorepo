import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow } from "@duyet/components";
import { addUtmParams } from "../../app/lib/utm";

const PERIOD = "Oct 2023 — Present";
const TENURE = "2 yrs 9 mos";

interface Post {
  title: string;
  href: string;
}

interface Role {
  title: string;
  period: string;
  body: string;
}

interface Milestone {
  label: string;
  body: string;
}

const posts: Post[] = [
  {
    title: "ClickHouse on Kubernetes ☸️",
    href: "https://blog.duyet.net/2024/03/clickhouse-on-kubernetes",
  },
  {
    title: "ClickHouse Monitoring 📊",
    href: "https://blog.duyet.net/2024/03/clickhouse-monitoring",
  },
  {
    title: "Building AI Agents on Cloudflare ⚡️",
    href: "https://blog.duyet.net/2026/05/building-ai-agents-cloudflare",
  },
  {
    title: "Why ClickHouse Should Be the Go-To Choice for Your Data Platform",
    href: "https://blog.duyet.net/2023/01/clickhouse",
  },
];

const roles: Role[] = [
  {
    title: "Senior Data Engineer",
    period: "Oct 2023 — Present",
    body: "Leading the data platform transformation from Spark + Iceberg + Trino to ClickHouse on Kubernetes. Simplified the data stack to be as lean and stable as possible. Designed internal ClickHouse table transformations, implemented custom User-Defined Functions with clickhouse-udf-rs, integrated DuckDB for fast ad-hoc processing, and built AI Agents utilizing LangGraph, LlamaIndex, Qdrant, Next.js, and TanStack.",
  },
];

const journey: Milestone[] = [
  {
    label: "Resolving Data Lake bottlenecks",
    body: "Began by addressing the limitations of Spark, Trino, and Iceberg. Tuned Spark parameters and optimized metadata footprint by cleaning up Iceberg snapshots to improve query performance.",
  },
  {
    label: "On-premise Kubernetes cluster",
    body: "Wired up a Rancher Kubernetes (k8s) cluster from scratch using on-prem VM machines, deploying namespaces, resource limits, and ingress policies as a team of two.",
  },
  {
    label: "ClickHouse migration & simplification",
    body: "Deprecated legacy storage systems and successfully migrated all historical data to a very large, high-throughput 3-node ClickHouse cluster. Replaced complex pipelines with internal ClickHouse transformations, drastically simplifying the data stack for maximum stability.",
  },
  {
    label: "Rust UDFs & DuckDB integrations",
    body: "Engineered high-performance data operations by writing custom User-Defined Functions in Rust (clickhouse-udf-rs) and utilizing DuckDB for efficient file formats and local analysis.",
  },
  {
    label: "Database tuning & performance",
    body: "Tuned tables, engines, and columns. Optimized compression types and codec settings on each column to yield the maximum performance and query speed.",
  },
  {
    label: "Observability & chmonitoring",
    body: "Built chmonitoring and developed multiple custom internal tools to automate database operations, query analysis, and performance monitoring.",
  },
  {
    label: "First LLM workflows",
    body: "Created the initial Text-to-SQL workflows and response synthesis engines leveraging LlamaIndex and custom LLM integrations.",
  },
  {
    label: "LangGraph agentic systems",
    body: "Evolved the LLM systems into multi-agent workflows using LangGraph in fast/agent modes. Equipped agents with skills, tool calling, Firecrawl, Qdrant vector database, and Cube.js.",
  },
  {
    label: "Dynamic UI & CI/CD",
    body: "Empowered AI agents to dynamically generate charts, dashboards, and explorer interfaces. Improved agentic software engineering practices to confidently deploy generated code directly to production.",
  },
  {
    label: "Global remote collaboration",
    body: "Collaborated seamlessly with Cartrack's worldwide team, keeping the data platform stable and shipping features while traveling across different countries.",
  },
];

export const Route = createFileRoute("/cartrack")({
  component: CartrackPage,
  head: () => ({
    meta: [
      { title: "Cartrack — Duyet's chapter | duyet.net" },
      {
        name: "description",
        content: `My ${TENURE} at Cartrack (${PERIOD}): building the data platform with ClickHouse on Kubernetes, tuning Spark/Trino/Iceberg, and building advanced LangGraph AI agents.`,
      },
    ],
    links: [{ rel: "canonical", href: "https://duyet.net/cartrack" }],
  }),
});

function CartrackPage() {
  return (
    <div className="page-enter bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="mx-auto max-w-[640px] px-[var(--rd-pad)] pt-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]">
        <Eyebrow>
          {PERIOD} · {TENURE}
        </Eyebrow>
        <h1 className="rd-display mt-[13px] text-[clamp(1.9rem,4vw,3rem)] leading-[1.04]">
          <span className="text-[var(--rd-accent)]">Cartrack</span>
        </h1>
        <p className="rd-lead mt-5 text-[clamp(1.02rem,1.4vw,1.15rem)] text-[var(--rd-text-2)]">
          Joined the global team at Cartrack, managing terabyte-scale data lakes and building AI agents 
          fully remotely while traveling across different countries. The journey started with tuning 
          Spark, Trino, and Iceberg performance, then transitioned to setting up an on-premise Rancher 
          Kubernetes cluster, and migrating legacy storage to a highly optimized 3-node ClickHouse cluster. 
          By designing internal table transformations, using custom Rust UDFs (clickhouse-udf-rs), and 
          integrating DuckDB, we made the data stack as simple and stable as possible. Later, the work 
          expanded to building fully agentic multi-agent systems using LangGraph, Qdrant, Cube.js, and Firecrawl.
        </p>

        <div className="mt-9 flex flex-col gap-5 border-t border-[var(--rd-border)] pt-7">
          {roles.map((r) => (
            <div key={r.title}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h2 className="text-[1.1rem] tracking-[-0.02em]">{r.title}</h2>
                <span className="font-[var(--font-mono)] text-[12px] text-[var(--rd-text-3)]">
                  {r.period}
                </span>
              </div>
              <p className="mt-1.5 text-[14.5px] leading-[1.55] text-[var(--rd-text-2)]">
                {r.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-9 border-t border-[var(--rd-border)] pt-7">
          <Eyebrow>How the platform evolved</Eyebrow>
          <ol className="mt-4 flex flex-col gap-4">
            {journey.map((m, i) => (
              <li key={m.label} className="flex gap-3">
                <span className="font-[var(--font-mono)] text-[12px] text-[var(--rd-text-3)] pt-[3px] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[14.5px] font-medium tracking-[-0.01em]">
                    {m.label}
                  </h3>
                  <p className="mt-1 text-[14px] leading-[1.55] text-[var(--rd-text-2)]">
                    {m.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-9 border-t border-[var(--rd-border)] pt-7">
          <Eyebrow>Related writing</Eyebrow>
          <ul className="mt-3 flex flex-col gap-2">
            {posts.map((p) => (
              <li key={p.href}>
                <a
                  href={addUtmParams(p.href, "cartrack_page", "related_writing")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rd-ulink text-[14.5px] text-[var(--rd-text-2)]"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
