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

type VirtualItem =
  | {
      type: "group";
      key: string;
      year: number;
      month?: string;
      modelCount: number;
    }
  | { type: "row"; key: string; models: Model[] };

/** Responsive column count for the card grid. */
function useColumns(): number {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return cols;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
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
  const cols = useColumns();

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
    const pushModels = (models: Model[]) => {
      for (const row of chunk(models, cols)) {
        items.push({
          type: "row",
          key: `row-${row[0].org}-${row[0].date}-${row[0].name}`,
          models: row,
        });
      }
    };

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

        const sortedMonths = Array.from(months.keys()).sort((a, b) =>
          b.localeCompare(a)
        );
        sortedMonths.forEach((month) => {
          const monthModels = months.get(month) || [];
          monthModels.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          items.push({
            type: "group",
            key: `group-${year}-${month}`,
            year,
            month,
            modelCount: monthModels.length,
          });
          pushModels(monthModels);
        });
      } else {
        items.push({
          type: "group",
          key: `group-${year}`,
          year,
          modelCount: yearModels.length,
        });
        pushModels(yearModels);
      }
    });
    return items;
  }, [sortedYears, modelsByYear, grouping, cols]);

  const rowVirtualizer = useWindowVirtualizer({
    count: virtualItems.length,
    scrollMargin,
    estimateSize: (index) => {
      const item = virtualItems[index];
      return item.type === "group" ? 80 : 300;
    },
    overscan: 6,
  });

  if (virtualItems.length === 0) {
    return (
      <div className="rd-card p-8 text-center">
        <p className="text-[var(--rd-text-3)]">
          No models found matching your filters.
        </p>
      </div>
    );
  }

  return (
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
        const offset =
          virtualRow.start - rowVirtualizer.options.scrollMargin;

        if (item.type === "group") {
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
                transform: `translateY(${offset}px)`,
              }}
            >
              <div className="mb-6 mt-2">
                <div className="flex items-end gap-4">
                  <span
                    className="select-none text-5xl sm:text-6xl font-bold leading-none text-[var(--rd-text-4)] font-[family-name:var(--font-sans)]"
                    aria-hidden="true"
                  >
                    {item.year}
                    {item.month && ` / ${item.month.slice(5)}`}
                  </span>
                  <div className="mb-1.5">
                    <span className="text-xs font-medium text-[var(--rd-text-3)] uppercase tracking-wider font-[family-name:var(--font-mono)]">
                      {item.modelCount} model{item.modelCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="mt-1 h-px bg-gradient-to-r from-[var(--rd-border)] to-transparent" />
              </div>
            </div>
          );
        }

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
              transform: `translateY(${offset}px)`,
            }}
          >
            <div
              className="grid gap-3 pb-3"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
            >
              {item.models.map((model) => (
                <ModelCardGrid
                  key={`${model.org}-${model.date}-${model.name}`}
                  model={model}
                  isSelectable={comparisonMode}
                  isSelected={selectedModelNames?.has(model.name) ?? false}
                  onSelectionChange={() => onToggleSelection?.(model)}
                  onClick={() => onModelClick?.(model)}
                  comparisonMode={comparisonMode}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
