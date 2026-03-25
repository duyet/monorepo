import { useMemo } from "react";
import { useTimelineKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import type { Model } from "@/lib/data";
import { ModelCard } from "./model-card";

interface TimelineProps {
  modelsByYear: Map<number, Model[]>;
  liteMode?: boolean;
  focusedIndex?: number;
  onFocusChange?: (index: number) => void;
  comparisonMode?: boolean;
  selectedModelNames?: Set<string>;
  onToggleSelection?: (model: Model) => void;
}

export function Timeline({
  modelsByYear,
  liteMode,
  focusedIndex = -1,
  onFocusChange,
  comparisonMode,
  selectedModelNames,
  onToggleSelection,
}: TimelineProps) {
  // Sort years descending (newest first)
  const sortedYears = useMemo(
    () => Array.from(modelsByYear.keys()).sort((a, b) => b - a),
    [modelsByYear]
  );

  // Flatten all models into a single array for keyboard navigation
  const flatModels = useMemo(() => {
    const result: Array<{ model: Model; year: number; yearIndex: number }> = [];
    for (const year of sortedYears) {
      const yearModels = modelsByYear.get(year) || [];
      yearModels.forEach((model, yearIndex) => {
        result.push({ model, year, yearIndex });
      });
    }
    return result;
  }, [modelsByYear, sortedYears]);

  // Calculate global indices for each year to handle focus
  const yearStartIndices = useMemo(() => {
    const indices = new Map<number, number>();
    let currentIndex = 0;
    for (const year of sortedYears) {
      indices.set(year, currentIndex);
      currentIndex += (modelsByYear.get(year) || []).length;
    }
    return indices;
  }, [modelsByYear, sortedYears]);

  // Keyboard navigation
  useTimelineKeyboardNavigation({
    isEnabled: focusedIndex >= 0,
    totalItems: flatModels.length,
    currentIndex: focusedIndex,
    onNavigate: onFocusChange || (() => {}),
  });

  if (sortedYears.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No models found
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div
      className="space-y-8"
      role="listbox"
      aria-label="Timeline of LLM models"
      tabIndex={focusedIndex >= 0 ? 0 : -1}
    >
      {sortedYears.map((year) => {
        const yearModels = modelsByYear.get(year) || [];
        const yearStartIndex = yearStartIndices.get(year) || 0;
        return (
          <div
            key={year}
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "0 500px",
            }}
          >
            {/* Sticky Year Header */}
            <div className="sticky top-0 z-20 -mx-1 px-1 pb-4 pt-2">
              <div className="flex items-end gap-4 bg-background/95 backdrop-blur-sm rounded-xl px-3 py-2 -mx-3">
                <span
                  className="select-none text-5xl sm:text-6xl font-bold leading-none text-foreground/10 font-[family-name:var(--font-display)]"
                  aria-hidden="true"
                >
                  {year}
                </span>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-[family-name:var(--font-mono)]">
                    {yearModels.length} model
                    {yearModels.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="mt-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>

            {/* Models for this year */}
            <div className="ml-2">
              {yearModels.map((model, index) => {
                const globalIndex = yearStartIndex + index;
                const isFocused = focusedIndex === globalIndex;
                const isSelected = selectedModelNames?.has(model.name) ?? false;
                return (
                  <div
                    key={`${model.org}-${model.date}-${model.name}-${index}`}
                    onClick={() => {
                      if (comparisonMode) {
                        onToggleSelection?.(model);
                      } else {
                        onFocusChange?.(globalIndex);
                      }
                    }}
                    className={`transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isFocused && !comparisonMode
                        ? "ring-2 ring-ring ring-offset-2"
                        : ""
                    }`}
                    role="option"
                    aria-selected={isFocused}
                    tabIndex={isFocused ? 0 : -1}
                    aria-label={`${model.name} by ${model.org}`}
                  >
                    <ModelCard
                      model={model}
                      isLast={index === yearModels.length - 1}
                      lite={liteMode}
                      isSelectable={comparisonMode}
                      isSelected={isSelected}
                      onSelectionChange={() => {
                        onToggleSelection?.(model);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
