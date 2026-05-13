import { ArrowRight } from "lucide-react";

interface WorkStackSectionProps {
  repositoryUrl: string;
}

const focusAreas = [
  {
    label: "Data systems",
    value: "Pipelines, warehouses, observability, and distributed services",
  },
  {
    label: "AI infrastructure",
    value: "Agent workflows, model routing, evaluation, and usage analytics",
  },
  {
    label: "Engineering practice",
    value: "Small tools, clean interfaces, production hygiene, and writing",
  },
];

const skills = [
  "Python",
  "Rust",
  "TypeScript",
  "Spark",
  "Airflow",
  "ClickHouse",
  "BigQuery",
  "Kafka",
  "Kubernetes",
  "AWS",
  "GCP",
  "LlamaIndex",
  "AI SDK",
  "LangGraph",
];

export function WorkStackSection({ repositoryUrl }: WorkStackSectionProps) {
  return (
    <div className="space-y-12 py-4 lg:space-y-14">
      <section>
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr] lg:items-start">
          <div className="max-w-md">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              Focus
            </p>
            <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
              Practical engineering, written down clearly.
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {focusAreas.map((item) => (
              <div
                key={item.label}
                className="grid gap-2 py-5 md:grid-cols-[180px_1fr] md:gap-8"
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {item.label}
                </p>
                <p className="text-base leading-7 text-[var(--muted-foreground)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              Stack
            </p>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Tools I reach for.
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--muted-foreground)]">
              A curated set of technologies for building reliable, scalable
              systems.
            </p>
          </div>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[var(--muted-foreground)]"
          >
            Repositories
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-y border-[var(--hairline)] py-5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="text-sm font-medium text-[var(--foreground)]"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

