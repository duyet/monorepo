import { ModelCard } from "./model-card";
import type { Model } from "@/lib/data";

interface TimelineProps {
  modelsByYear: Map<number, Model[]>;
  liteMode?: boolean;
}

export function Timeline({ modelsByYear, liteMode }: TimelineProps) {
  // Sort years descending (newest first)
  const sortedYears = Array.from(modelsByYear.keys()).sort((a, b) => b - a);

  if (sortedYears.length === 0) {
    return (
      <div
        className="rounded-lg border p-8 text-center"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>
          No models found matching your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedYears.map((year) => {
        const yearModels = modelsByYear.get(year) || [];
        return (
          <div
            key={year}
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "0 500px",
            }}
          >
            {/* Year Header */}
            <div className="mb-6 flex items-center gap-4 overflow-hidden">
              <div className="relative flex items-center shrink-0 overflow-hidden">
                {/* Large background year as watermark */}
                <span
                  className="select-none text-4xl font-bold leading-none"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--year-watermark)",
                  }}
                  aria-hidden="true"
                >
                  {year}
                </span>
              </div>
              <div
                className="h-px flex-1 min-w-0 shrink"
                style={{ backgroundColor: "var(--border)" }}
              />
              <span
                className="text-xs uppercase tracking-widest shrink-0 whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                }}
              >
                {yearModels.length} model{yearModels.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Models for this year */}
            <div className="ml-2">
              {yearModels.map((model, index) => (
                <ModelCard
                  key={`${model.org}-${model.date}-${model.name}`}
                  model={model}
                  isLast={index === yearModels.length - 1}
                  lite={liteMode}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
