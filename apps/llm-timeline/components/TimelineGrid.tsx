import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Model } from "@/lib/data";
import { ModelCardGrid } from "./ModelCardGrid";

interface TimelineGridProps {
  modelsByYear: Map<number, Model[]>;
  comparisonMode?: boolean;
  selectedModelNames?: Set<string>;
  onToggleSelection?: (model: Model) => void;
  onModelClick?: (model: Model) => void;
  grouping?: "year" | "month";
}

interface VirtualItem {
  type: "group" | "model";
  key: string;
  year?: number;
  month?: string;
  model?: Model;
  groupIndex?: number;
  modelCount?: number;
}

export function TimelineGrid({
  modelsByYear,
  comparisonMode,
  selectedModelNames,
  onToggleSelection,
  onModelClick,
  grouping = "year",
}: TimelineGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(200);

  useEffect(() => {
    if (parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setScrollMargin(rect.top + scrollTop);
    }
  }, [modelsByYear]);

  const sortedYears = useMemo(
    () => Array.from(modelsByYear.keys()).sort((a, b) => b - a),
    [modelsByYear]
  );

  const virtualItems = useMemo<VirtualItem[]>(() => {
    const items: VirtualItem[] = [];
    sortedYears.forEach((year) => {
      const yearModels = modelsByYear.get(year) || [];

      if (grouping === "month") {
        const months = new Map<string, Model[]>();
        yearModels.forEach((model) => {
          const monthKey = model.date.slice(0, 7);
          const existing = months.get(monthKey) || [];
          existing.push(model);
          months.set(monthKey, existing);
        });

        const sortedMonths = Array.from(months.keys()).sort((a, b) => b.localeCompare(a));
        sortedMonths.forEach((month) => {
          const monthModels = months.get(month) || [];
          monthModels.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          items.push({
            type: "group",
            key: `group-${year}-${month}`,
            year,
            month,
            groupIndex: items.length,
            modelCount: monthModels.length,
          });

          monthModels.forEach((model) => {
            items.push({
              type: "model",
              key: `${model.org}-${model.date}-${model.name}`,
              model,
            });
          });
        });
      } else {
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
      }
    });
    return items;
  }, [sortedYears, modelsByYear, grouping]);

  if (virtualItems.length === 0) {
    return (
      <div className="rd-card p-8 text-center">
        <p className="text-[var(--rd-text-3)]">No models found matching your filters.</p>
      </div>
    );
  }

  const rowVirtualizer = useWindowVirtualizer({
    count: virtualItems.length,
    scrollMargin,
    estimateSize: (index) => {
      const item = virtualItems[index];
      if (item.type === "group") return 80;
      return 280;
    },
    overscan: 8,
  });

  return (
    <div className="rd-g3">
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
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                  padding: "0 1rem",
                }}
              >
                <div className="mb-6">
                  <div className="flex items-end gap-4">
                    <span
                      className="select-none text-5xl sm:text-6xl font-bold leading-none text-[var(--rd-text-4)] font-[family-name:var(--font-sans)]"
                      aria-hidden="true"
                    >
                      {groupItem.year}
                      {groupItem.month && ` / ${groupItem.month.slice(5)}`}
                    </span>
                    <div className="mb-1.5">
                      <span className="text-xs font-medium text-[var(--rd-text-3)] uppercase tracking-wider font-[family-name:var(--font-mono)]">
                        {groupItem.modelCount} model{groupItem.modelCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 h-px bg-gradient-to-r from-[var(--rd-border)] to-transparent" />
                </div>
              </div>
            );
          }

          const modelItem = item as VirtualItem & { type: "model" };
          const isSelected = selectedModelNames?.has(modelItem.model!.name) ?? false;

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
              }}
            >
              <ModelCardGrid
                model={modelItem.model!}
                isSelectable={comparisonMode}
                isSelected={isSelected}
                onSelectionChange={() => onToggleSelection?.(modelItem.model!)}
                onClick={() => onModelClick?.(modelItem.model!)}
                comparisonMode={comparisonMode}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}