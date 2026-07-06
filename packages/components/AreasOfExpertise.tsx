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

import * as SVGLogos from "@thesvg/react";

const TAG_LOGOS: Record<string, any> = {
  ClickHouse: SVGLogos.Clickhouse,
  "Apache Spark": SVGLogos.ApacheSpark,
  Airflow: SVGLogos.ApacheAirflow,
  BigQuery: SVGLogos.GcpBigquery,
  Kafka: SVGLogos.ApacheKafka,
  Python: SVGLogos.Python,
  "Claude API": SVGLogos.Claude,
  LangGraph: SVGLogos.Langgraph,
  LlamaIndex: SVGLogos.Llamaindex,
  TypeScript: SVGLogos.Typescript,
  Kubernetes: SVGLogos.Kubernetes,
  Terraform: SVGLogos.Terraform,
  AWS: SVGLogos.Aws,
  GCP: SVGLogos.GoogleCloud,
  Cloudflare: SVGLogos.Cloudflare,
  Rust: SVGLogos.Rust,
  "Cloudflare Workers": SVGLogos.CloudflareWorkers,
  React: SVGLogos.React,
  "Tailwind CSS": SVGLogos.TailwindCss,
  "GitHub Actions": SVGLogos.GithubActions,
  Turborepo: SVGLogos.Turborepo,
  OpenTelemetry: SVGLogos.Opentelemetry,
  Grafana: SVGLogos.Grafana,
  GitHub: SVGLogos.Github,
};

function TagBadge({ tag }: { tag: string }) {
  const Logo = TAG_LOGOS[tag];
  return (
    <Badge
      variant="secondary"
      className="text-xs inline-flex items-center gap-1.5 py-0.5"
    >
      {Logo && <Logo width={12} height={12} className="shrink-0" />}
      {tag}
    </Badge>
  );
}

function AreaCard({ area }: { area: Area }) {
  return (
    <div className="flex h-full flex-col gap-3 bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight">{area.title}</h3>
        <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
          {area.years}yr
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
        {area.description}
      </p>
      <div className="mt-auto space-y-2 pt-2">
        <p className="text-sm tabular-nums">
          <span className="font-semibold tracking-tight">
            {area.projectCount.toLocaleString()}
          </span>
          <span className="ml-1.5 text-muted-foreground">projects</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {area.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
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
  const featured = areas.find((a) => a.featured);
  const rest = areas.filter((a) => !a.featured);

  const totalProjects = areas.reduce((sum, a) => sum + a.projectCount, 0);
  const defaultSubheading = `${areas[0]?.years ?? 8}+ years of delivery across ${areas.length} disciplines, ${totalProjects.toLocaleString()} projects shipped`;

  return (
    <section>
      {!hideHeader && (
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            {subheading ?? defaultSubheading}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
        {featured && (
          <div className="md:col-span-2 lg:col-span-2">
            <AreaCard area={featured} />
          </div>
        )}
        {rest.map((area) => (
          <AreaCard key={area.title} area={area} />
        ))}
      </div>
    </section>
  );
}

export default AreasOfExpertise;
