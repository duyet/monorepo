import { Badge } from "./ui/badge";

export type Area = {
  title: string;
  years: number;
  description: string;
  projectCount: number;
  tags: string[];
  featured?: boolean;
};

export const DEFAULT_AREAS: Area[] = [
  {
    title: "Data Engineering",
    years: 8,
    description:
      "End-to-end pipelines from raw event streams to analytics-ready tables. ClickHouse as the primary OLAP layer — petabyte-scale ingestion, columnar query optimization, and materialized view patterns. Airflow for orchestration; Spark for heavy batch transforms.",
    projectCount: 312,
    tags: [
      "ClickHouse",
      "Apache Spark",
      "Airflow",
      "BigQuery",
      "Kafka",
      "dbt",
      "Python",
    ],
    featured: true,
  },
  {
    title: "AI Agent Engineering",
    years: 4,
    description:
      "Agent frameworks, model routing, and evaluation infrastructure. AnyRouter for multi-provider fallback and BYOK routing. LangGraph and LlamaIndex for workflow orchestration. Usage analytics baked in from day one.",
    projectCount: 87,
    tags: ["Claude API", "LangGraph", "LlamaIndex", "AI SDK", "TypeScript"],
  },
  {
    title: "Cloud Infrastructure",
    years: 6,
    description:
      "Kubernetes clusters on AWS and GCP, Helm chart authoring, Terraform for IaC. Cloudflare Workers for edge compute — zero cold-start, global, cheap.",
    projectCount: 145,
    tags: ["Kubernetes", "Terraform", "AWS", "GCP", "Cloudflare"],
  },
  {
    title: "Backend & APIs",
    years: 7,
    description:
      "REST and GraphQL services in Python, Rust, and TypeScript. Cloudflare D1 + KV for edge-native persistence. Durable Objects for stateful agent sessions.",
    projectCount: 204,
    tags: ["Rust", "Python", "TypeScript", "Cloudflare Workers", "D1"],
  },
  {
    title: "Frontend & UI",
    years: 5,
    description:
      "React and TanStack Start with SSG. shadcn/ui + Tailwind as the component layer across 8 sibling apps. Performance-first: sub-second LCP, no hydration overhead for static routes.",
    projectCount: 178,
    tags: ["React", "TanStack Start", "shadcn/ui", "Tailwind CSS"],
  },
  {
    title: "DevOps & Observability",
    years: 5,
    description:
      "GitHub Actions CI/CD with Turborepo caching. Structured logging into ClickHouse; MotherDuck for ad-hoc querying. OpenTelemetry traces for agent workflows.",
    projectCount: 93,
    tags: ["GitHub Actions", "Turborepo", "OpenTelemetry", "Grafana"],
  },
  {
    title: "Open Source",
    years: 8,
    description:
      "Public libraries, dashboards, and reference implementations. rust-tieng-viet, ClickHouse Monitor, ShareHTML, LLM Timeline — built and maintained openly.",
    projectCount: 54,
    tags: ["Rust", "TypeScript", "OSS", "GitHub"],
  },
];

const TAG_ICONS: Record<string, string> = {
  ClickHouse: "clickhouse",
  "Apache Spark": "apachespark",
  Airflow: "apacheairflow",
  BigQuery: "googlebigquery",
  Kafka: "apachekafka",
  Python: "python",
  "Claude API": "anthropic",
  LangGraph: "langchain",
  LlamaIndex: "llamaindex",
  TypeScript: "typescript",
  Kubernetes: "kubernetes",
  Terraform: "terraform",
  AWS: "amazonwebservices",
  GCP: "googlecloud",
  Cloudflare: "cloudflare",
  Rust: "rust",
  "Cloudflare Workers": "cloudflare",
  React: "react",
  "Tailwind CSS": "tailwindcss",
  "GitHub Actions": "githubactions",
  Turborepo: "turborepo",
  OpenTelemetry: "opentelemetry",
  Grafana: "grafana",
  GitHub: "github",
};

function TagBadge({ tag }: { tag: string }) {
  // Prefer static <img> over @thesvg/react — those components call useId() and
  // blow up TanStack Start SSR, which empties <main> until client hydration.
  const icon = TAG_ICONS[tag];
  return (
    <Badge
      variant="secondary"
      className="text-[10.5px] inline-flex items-center gap-1 px-1.5 py-0 font-normal"
    >
      {icon ? (
        <img
          src={`https://cdn.simpleicons.org/${icon}`}
          alt=""
          width={10}
          height={10}
          className="shrink-0 dark:invert"
          loading="lazy"
        />
      ) : null}
      {tag}
    </Badge>
  );
}

function AreaCard({ area }: { area: Area }) {
  return (
    <div className="flex flex-col gap-1 bg-background px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[13.5px] font-semibold tracking-tight leading-tight">
          {area.title}
        </h3>
        <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground tabular-nums">
          {area.years}yr
        </span>
      </div>
      <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2">
        {area.description}
      </p>
      <div className="flex flex-wrap gap-1">
        {area.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
    </div>
  );
}

type AreasOfExpertiseProps = {
  heading?: string;
  subheading?: string;
  areas?: Area[];
  hideHeader?: boolean;
};

export function AreasOfExpertise({
  heading = "Areas of Expertise",
  subheading,
  areas = DEFAULT_AREAS,
  hideHeader = false,
}: AreasOfExpertiseProps) {
  const totalProjects = areas.reduce((sum, a) => sum + a.projectCount, 0);
  const defaultSubheading = `${areas[0]?.years ?? 8}+ years of delivery across ${areas.length} disciplines, ${totalProjects.toLocaleString()} projects shipped`;

  return (
    <section>
      {!hideHeader && (
        <div className="mb-3">
          <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground max-w-xl">
            {subheading ?? defaultSubheading}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-border">
        {areas.map((area, i) => (
          <div
            key={area.title}
            className={`border-b border-r border-border ${
              i === areas.length - 1 && areas.length % 2 === 1
                ? "sm:col-span-2"
                : ""
            }`}
          >
            <AreaCard area={area} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default AreasOfExpertise;
