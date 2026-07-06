import { DistRows } from "@duyet/components";

export function TechStackRadar() {
  const languages = [
    { name: "TypeScript", pct: 42 },
    { name: "Rust", pct: 28 },
    { name: "Python", pct: 18 },
    { name: "SQL", pct: 12 },
  ];

  const models = [
    { name: "Claude 3.5 Sonnet", pct: 65 },
    { name: "Gemini", pct: 20 },
    { name: "GPT-4o", pct: 10 },
    { name: "Llama", pct: 5 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Languages Card */}
      <div className="rd-card p-6 bg-[#faf9f6] dark:bg-[#141413] border border-[var(--rd-border)] flex flex-col justify-between hover:border-[var(--rd-accent)] transition-colors duration-200">
        <div>
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-base font-semibold tracking-tight text-[var(--rd-text)]">
              Core Languages
            </h3>
            <span className="text-[10px] font-mono text-[var(--rd-text-3)] uppercase tracking-wider">
              production / oss
            </span>
          </div>
          <p className="text-xs text-[var(--rd-text-2)] mb-6 leading-relaxed">
            Active languages across primary data pipelines, agent microservices,
            and client-side web architectures.
          </p>
          <DistRows rows={languages} color="var(--rd-accent)" />
        </div>
      </div>

      {/* Models Card */}
      <div className="rd-card p-6 bg-[#f5fbf7] dark:bg-[#0f1411] border border-[var(--rd-border)] flex flex-col justify-between hover:border-[var(--rd-accent)] transition-colors duration-200">
        <div>
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-base font-semibold tracking-tight text-[var(--rd-text)]">
              LLMs & Model Routing
            </h3>
            <span className="text-[10px] font-mono text-[var(--rd-text-3)] uppercase tracking-wider">
              inference share
            </span>
          </div>
          <p className="text-xs text-[var(--rd-text-2)] mb-6 leading-relaxed">
            Percentage of total token volume routed dynamically through
            Anthropic, Google, OpenAI, and local runners.
          </p>
          <DistRows rows={models} color="oklch(70.5% .213 47.604)" />
        </div>
      </div>
    </div>
  );
}
