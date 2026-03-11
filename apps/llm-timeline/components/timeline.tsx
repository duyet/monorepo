"use client";

import { useMemo } from "react";
import { ModelCard } from "./model-card";
import type { Model } from "@/lib/data";
import { useTimelineKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

interface TimelineProps {
  modelsByYear: Map<number, Model[]>;
  liteMode?: boolean;
  focusedIndex?: number;
  onFocusChange?: (index: number) => void;
}

export function Timeline({
  modelsByYear,
  liteMode,
  focusedIndex = -1,
  onFocusChange,
}: TimelineProps) {
  // Sort years descending (newest first)
  const sortedYears = Array.from(modelsByYear.keys()).sort((a, b) => b - a);

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
              {yearModels.map((model, index) => {
                const globalIndex = yearStartIndex + index;
                const isFocused = focusedIndex === globalIndex;
                return (
                  <div
                    key={`${model.org}-${model.date}-${model.name}-${index}`}
                    onClick={() => onFocusChange?.(globalIndex)}
                    className={isFocused ? "ring-2 ring-[var(--accent)] ring-offset-2 rounded-lg" : ""}
                    role="option"
                    aria-selected={isFocused}
                    tabIndex={isFocused ? 0 : -1}
                    aria-label={`${model.name} by ${model.org}`}
                  >
                    <ModelCard
                      model={model}
                      isLast={index === yearModels.length - 1}
                      lite={liteMode}
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
