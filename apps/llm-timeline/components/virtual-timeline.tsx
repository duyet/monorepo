"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Model } from "@/lib/data";
import { ModelCard } from "./model-card";

interface VirtualTimelineProps {
  modelsByYear: Map<number, Model[]>;
  liteMode?: boolean;
  comparisonMode?: boolean;
  selectedModelNames?: Set<string>;
  onToggleSelection?: (model: Model) => void;
}

interface VirtualItem {
  type: "group" | "model";
  key: string;
  year?: number;
  model?: Model;
  groupIndex?: number;
  modelCount?: number;
}

export function VirtualTimeline({
  modelsByYear,
  liteMode,
  comparisonMode,
  selectedModelNames,
  onToggleSelection,
}: VirtualTimelineProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(200); // Default offset

  // Calculate offset from top of page when container mounts or filter state changes
  useEffect(() => {
    if (parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setScrollMargin(rect.top + scrollTop);
    }
  }, [modelsByYear]);

  // Sort years descending (newest first)
  const sortedYears = useMemo(
    () => Array.from(modelsByYear.keys()).sort((a, b) => b - a),
    [modelsByYear]
  );

  // Flatten grouped data into a list of virtual items
  const virtualItems = useMemo<VirtualItem[]>(() => {
    const items: VirtualItem[] = [];
    sortedYears.forEach((year) => {
      const yearModels = modelsByYear.get(year) || [];
      items.push({
        type: "group",
        key: `group-${year}`,
        year,
        groupIndex: items.length,
        modelCount: yearModels.length,
      });
      yearModels.forEach((model) => {
        items.push({
          type: "model",
          key: `${model.org}-${model.date}-${model.name}`,
          model,
        });
      });
    });
    return items;
  }, [sortedYears, modelsByYear]);

  if (virtualItems.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-8 text-center">
        <p className="text-neutral-500 dark:text-neutral-400">
          No models found matching your filters.
        </p>
      </div>
    );
  }

  const rowVirtualizer = useWindowVirtualizer({
    count: virtualItems.length,
    scrollMargin: scrollMargin, // Offset from top of page
    estimateSize: (index) => {
      const item = virtualItems[index];
      if (item.type === "group") return 80; // Year header height
      return liteMode ? 100 : 180; // Model card height
    },
    overscan: 5,
  });

  return (
    <div className="rounded-lg">
      <div
        ref={parentRef}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
          width: "100%",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = virtualItems[virtualRow.index];
          const isGroup = item.type === "group";

          if (isGroup) {
            const groupItem = item as VirtualItem & {
              type: "group";
              modelCount: number;
            };
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: "0 1rem",
                }}
              >
                {/* Year Header */}
                <div className="mb-8">
                  <div className="flex items-end gap-4">
                    <span
                      className="select-none text-6xl sm:text-7xl font-bold leading-none text-neutral-200 dark:text-neutral-700 font-[family-name:var(--font-display)]"
                      aria-hidden="true"
                    >
                      {groupItem.year}
                    </span>
                    <div className="mb-2">
                      <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        {groupItem.modelCount} model
                        {groupItem.modelCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-px bg-gradient-to-r from-neutral-200 dark:from-white/10 to-transparent" />
                </div>
              </div>
            );
          }

          // Model card
          const modelItem = item as VirtualItem & { type: "model" };
          const isSelected =
            selectedModelNames?.has(modelItem.model!.name) ?? false;
          return (
            <div
              key={virtualRow.key}
              onClick={() => {
                if (comparisonMode) {
                  onToggleSelection?.(modelItem.model!);
                }
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              <ModelCard
                model={modelItem.model!}
                lite={liteMode}
                isLast={false}
                isSelectable={comparisonMode}
                isSelected={isSelected}
                onSelectionChange={() => {
                  onToggleSelection?.(modelItem.model!);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
