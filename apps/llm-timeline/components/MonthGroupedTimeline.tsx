import { useMemo, useState } from "react";
import type { Model } from "@/lib/data";
import { ModelCardGrid } from "./ModelCardGrid";
import { groupByYearMonth } from "@/lib/utils";

interface MonthGroupedTimelineProps {
  models: Model[];
  comparisonMode?: boolean;
  selectedModelNames?: Set<string>;
  onToggleSelection?: (model: Model) => void;
  onModelClick?: (model: Model) => void;
}

export function MonthGroupedTimeline({
  models,
  comparisonMode,
  selectedModelNames,
  onToggleSelection,
  onModelClick,
}: MonthGroupedTimelineProps) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const yearMonthGroups = useMemo(() => groupByYearMonth(models), [models]);

  const sortedYears = useMemo(
    () => Array.from(yearMonthGroups.keys()).sort((a, b) => b - a),
    [yearMonthGroups]
  );

  if (models.length === 0) {
    return (
      <div className="rd-card p-8 text-center">
        <p className="text-[var(--rd-text-3)]">No models found matching your filters.</p>
      </div>
    );
  }

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  return (
    <div className="rd-g3">
      {sortedYears.map((year) => {
        const monthGroups = yearMonthGroups.get(year)!;
        const isExpanded = expandedYears.has(year);
        const totalModels = Array.from(monthGroups.values()).reduce((sum, m) => sum + m.length, 0);

        return (
          <div key={year} className="col-span-full">
            <button
              onClick={() => toggleYear(year)}
              className="w-full flex items-end gap-4 p-3 bg-[var(--rd-surface)] rounded-[var(--rd-r)] border border-[var(--rd-border)] hover:bg-[var(--rd-surface-2)] transition-colors text-left"
              aria-expanded={isExpanded}
            >
              <span
                className="select-none text-4xl sm:text-5xl font-bold leading-none text-[var(--rd-text-4)] font-[family-name:var(--font-sans)]"
                aria-hidden="true"
              >
                {year}
              </span>
              <span className="text-xs font-medium text-[var(--rd-text-3)] uppercase tracking-wider font-[family-name:var(--font-mono)]">
                {totalModels} model{totalModels !== 1 ? "s" : ""}
              </span>
              <svg
                className={`ml-auto h-5 w-5 text-[var(--rd-text-3)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isExpanded && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {Array.from(monthGroups.keys())
                  .sort((a, b) => b.localeCompare(a))
                  .map((month) => {
                    const monthModels = monthGroups.get(month)!;
                    const monthName = new Date(`${month}-01`).toLocaleDateString("en-US", { month: "short" });

                    return (
                      <div key={month} className="mb-6">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="text-2xl font-bold text-[var(--rd-text-2)] font-[family-name:var(--font-sans)]">
                            {monthName}
                          </span>
                          <div className="mb-1">
                            <span className="text-xs font-medium text-[var(--rd-text-3)] uppercase tracking-wider font-[family-name:var(--font-mono)]">
                              {monthModels.length} model{monthModels.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-[var(--rd-border)] to-transparent" />
                        </div>
                        <div className="rd-g3 gap-3">
                          {monthModels.map((model) => {
                            const isSelected = selectedModelNames?.has(model.name) ?? false;
                            return (
                              <ModelCardGrid
                                key={`${model.org}-${model.date}-${model.name}`}
                                model={model}
                                isSelectable={comparisonMode}
                                isSelected={isSelected}
                                onSelectionChange={() => onToggleSelection?.(model)}
                                onClick={() => onModelClick?.(model)}
                                comparisonMode={comparisonMode}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}