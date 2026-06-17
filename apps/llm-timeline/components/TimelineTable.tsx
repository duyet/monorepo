import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Model } from "@/lib/data";
import { getLicenseBadgeVariant } from "@/lib/utils";

interface TimelineTableProps {
  modelsByYear: Map<number, Model[]>;
}

type Row =
  | { type: "group"; key: string; year: number; modelCount: number }
  | { type: "model"; key: string; model: Model };

/** Shared grid template so header and body columns stay aligned. */
const COLS =
  "grid grid-cols-[minmax(0,1fr)_5.5rem_5rem] sm:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_7rem_6rem_5.5rem] items-center gap-3";

export function TimelineTable({ modelsByYear }: TimelineTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(200);

  useEffect(() => {
    if (parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setScrollMargin(rect.top + scrollTop);
    }
  }, [modelsByYear]);

  const rows = useMemo<Row[]>(() => {
    const items: Row[] = [];
    const years = Array.from(modelsByYear.keys()).sort((a, b) => b - a);
    years.forEach((year) => {
      const models = modelsByYear.get(year) || [];
      items.push({
        type: "group",
        key: `group-${year}`,
        year,
        modelCount: models.length,
      });
      models.forEach((model) => {
        items.push({
          type: "model",
          key: `${model.org}-${model.date}-${model.name}`,
          model,
        });
      });
    });
    return items;
  }, [modelsByYear]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    scrollMargin,
    estimateSize: (index) => (rows[index].type === "group" ? 52 : 44),
    overscan: 12,
  });

  if (rows.length === 0) {
    return (
      <div className="rd-card p-8 text-center">
        <p className="text-[var(--rd-text-3)]">
          No models found matching your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rd-card overflow-hidden">
      {/* Column header */}
      <div
        className={`${COLS} border-b border-[var(--rd-border)] bg-[var(--rd-surface-2)] px-4 py-2.5 text-[10.5px] font-medium uppercase tracking-wider text-[var(--rd-text-3)] font-[family-name:var(--font-mono)]`}
      >
        <span>Model</span>
        <span className="hidden sm:block">Organization</span>
        <span className="hidden sm:block">Date</span>
        <span>Params</span>
        <span>License</span>
      </div>

      <div
        ref={parentRef}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
          width: "100%",
        }}
      >
        {virtualizer.getVirtualItems().map((vrow) => {
          const row = rows[vrow.index];
          const offset = vrow.start - virtualizer.options.scrollMargin;
          const base = {
            position: "absolute" as const,
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${offset}px)`,
          };

          if (row.type === "group") {
            return (
              <div
                key={vrow.key}
                data-index={vrow.index}
                ref={virtualizer.measureElement}
                style={base}
              >
                <div className="flex items-baseline gap-3 border-b border-[var(--rd-border)] bg-[var(--rd-bg)] px-4 py-3">
                  <span className="text-lg font-bold text-[var(--rd-text-2)] font-[family-name:var(--font-sans)]">
                    {row.year}
                  </span>
                  <span className="text-[10.5px] font-medium uppercase tracking-wider text-[var(--rd-text-3)] font-[family-name:var(--font-mono)]">
                    {row.modelCount} model{row.modelCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            );
          }

          const m = row.model;
          return (
            <div
              key={vrow.key}
              data-index={vrow.index}
              ref={virtualizer.measureElement}
              style={base}
            >
              <div
                className={`${COLS} border-b border-[var(--rd-border)] px-4 py-2.5 text-sm transition-colors hover:bg-[var(--rd-surface-2)]`}
              >
                <span className="min-w-0 truncate font-medium text-[var(--rd-text)]">
                  {m.name}
                </span>
                <span className="hidden min-w-0 truncate text-[var(--rd-text-2)] sm:block">
                  {m.org}
                </span>
                <span className="hidden text-[var(--rd-text-3)] font-[family-name:var(--font-mono)] text-xs sm:block">
                  {m.date}
                </span>
                <span className="text-[var(--rd-text-3)] font-[family-name:var(--font-mono)] text-xs">
                  {m.params || "—"}
                </span>
                <span>
                  <Badge variant={getLicenseBadgeVariant(m.license)}>
                    {m.license}
                  </Badge>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
