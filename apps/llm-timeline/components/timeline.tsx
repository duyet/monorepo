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
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-8 text-center">
        <p className="text-neutral-500 dark:text-neutral-400">
          No models found matching your filters.
        </p>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
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
            <div className="mb-6 flex items-center gap-4 overflow-hidden">
              <div className="relative flex items-center shrink-0 overflow-hidden">
                {/* Large background year as watermark */}
                <span
                  className="select-none text-4xl font-bold leading-none text-neutral-200 dark:text-neutral-700 font-[family-name:var(--font-mono)]"
                  aria-hidden="true"
                >
                  {year}
                </span>
              </div>
              <div className="h-px flex-1 min-w-0 shrink bg-neutral-200 dark:bg-white/10" />
              <span className="text-xs uppercase tracking-widest shrink-0 whitespace-nowrap font-[family-name:var(--font-mono)] text-neutral-500 dark:text-neutral-400">
                {yearModels.length} model{yearModels.length !== 1 ? "s" : ""}
              </span>
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
                        ? "ring-2 ring-neutral-400 dark:ring-neutral-500 ring-offset-2 rounded-xl"
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
