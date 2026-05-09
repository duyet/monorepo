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
    <div className="space-y-32 py-10 lg:space-y-48">
      <section className="">
        <div className="grid gap-16 lg:grid-cols-[0.7fr_1fr] lg:items-start">
          <div className="max-w-md">
            <p className="mb-6 font-serif text-xl italic text-[var(--primary)]">Focus</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Practical engineering, written down clearly.
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {focusAreas.map((item) => (
              <div
                key={item.label}
                className="grid gap-4 py-10 md:grid-cols-[200px_1fr] md:gap-12 lg:py-14"
              >
                <p className="font-serif text-xl text-[var(--muted-foreground)] opacity-60">
                  {item.label}
                </p>
                <p className="text-2xl font-normal leading-snug tracking-tight text-[var(--body-strong)] lg:text-3xl">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-6 font-serif text-xl italic text-[var(--primary)]">Stack</p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl">
              Tools I reach for.
            </h2>
            <p className="mt-6 text-xl text-[var(--muted-foreground)] lg:text-2xl">
              A curated set of technologies for building reliable, scalable systems.
            </p>
          </div>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-serif text-2xl hover:text-[var(--primary)] transition-colors lg:text-3xl"
          >
            Repositories
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="mt-16 flex flex-wrap gap-x-10 gap-y-6 font-serif text-3xl tracking-tight text-[var(--foreground)]/80 md:text-4xl lg:text-5xl lg:leading-tight">
          {skills.map((skill) => (
            <span key={skill} className="hover:text-[var(--primary)] transition-colors cursor-default">
              {skill}
            </span>
          ))}
          <span className="text-[var(--primary)] opacity-40">✱</span>
        </div>
      </section>
    </div>
  );
}

