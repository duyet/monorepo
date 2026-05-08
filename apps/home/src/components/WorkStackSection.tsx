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
    <>
      <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:px-8 lg:mt-32 lg:px-10 xl:mt-40">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--muted-foreground)]">Work</p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Practical engineering, written down clearly.
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {focusAreas.map((item) => (
              <div
                key={item.label}
                className="grid gap-3 py-6 md:grid-cols-[180px_1fr] md:gap-8"
              >
                <p className="text-sm font-semibold uppercase tracking-normal text-[var(--muted-foreground)]">
                  {item.label}
                </p>
                <p className="text-xl font-medium leading-tight tracking-tight">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:px-8 lg:mt-32 lg:px-10 xl:mt-40">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--muted-foreground)]">Stack</p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Tools I reach for.
            </h2>
          </div>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-base font-medium"
          >
            Repositories
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-5 gap-y-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]/90 md:text-3xl">
          {skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>
    </>
  );
}
