"use client";

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
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-12 text-center">
        <p className="text-lg font-medium text-neutral-400 dark:text-neutral-500">
          No models found
        </p>
        <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div
      className="space-y-10"
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
            {/* Year Header */}
            <div className="mb-8">
              <div className="flex items-end gap-4">
                <span
                  className="select-none text-6xl sm:text-7xl font-bold leading-none text-neutral-200 dark:text-neutral-700 font-[family-name:var(--font-display)]"
                  aria-hidden="true"
                >
                  {year}
                </span>
                <div className="mb-2">
                  <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-[family-name:var(--font-mono)]">
                    {yearModels.length} model{yearModels.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="mt-2 h-px bg-gradient-to-r from-neutral-200 dark:from-white/10 to-transparent" />
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
                    className={
                      isFocused && !comparisonMode
                        ? "ring-2 ring-neutral-300 dark:ring-neutral-500 ring-offset-2 rounded-xl"
                        : ""
                    }
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
