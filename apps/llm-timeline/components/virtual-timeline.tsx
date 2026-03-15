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
                <div className="mb-6 flex items-center gap-4 overflow-hidden">
                  <div className="relative flex items-center shrink-0 overflow-hidden">
                    <span
                      className="select-none text-4xl font-bold leading-none"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--year-watermark)",
                      }}
                      aria-hidden="true"
                    >
                      {groupItem.year}
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
                    {groupItem.modelCount} model
                    {groupItem.modelCount !== 1 ? "s" : ""}
                  </span>
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
