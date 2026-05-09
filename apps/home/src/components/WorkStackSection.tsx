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
    <div className="space-y-24 py-10 lg:space-y-36">
      <section className="">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1fr] lg:items-start">
          <div className="max-w-md">
            <p className="mb-4 font-serif text-lg italic text-[var(--primary)]">Focus</p>
            <h2 className="font-serif text-3xl leading-tight sm:text-4xl lg:text-[48px]">
              Practical engineering, written down clearly.
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {focusAreas.map((item) => (
              <div
                key={item.label}
                className="grid gap-3 py-8 md:grid-cols-[200px_1fr] md:gap-10 lg:py-10"
              >
                <p className="font-serif text-lg text-[var(--muted-foreground)] opacity-60 lg:text-[22px]">
                  {item.label}
                </p>
                <p className="text-xl font-normal leading-snug tracking-tight text-[var(--body-strong)] lg:text-[28px]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 font-serif text-lg italic text-[var(--primary)]">Stack</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[48px]">
              Tools I reach for.
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)] lg:text-xl">
              A curated set of technologies for building reliable, scalable systems.
            </p>
          </div>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-serif text-xl hover:text-[var(--primary)] transition-colors lg:text-[28px]"
          >
            Repositories
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 font-serif text-2xl tracking-tight text-[var(--foreground)]/80 md:text-3xl lg:text-[36px] lg:leading-tight">
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


