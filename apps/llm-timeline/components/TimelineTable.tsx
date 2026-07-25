import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Model } from "@/lib/data";
import { getLicenseBadgeVariant } from "@/lib/utils";

interface TimelineTableProps {
  modelsByYear: Map<number, Model[]>;
}

type Row =
  | { type: "group"; key: string; year: number; modelCount: number }
  | { type: "model"; key: string; model: Model };

const GROUP_ROW_HEIGHT = 52;
const MODEL_ROW_HEIGHT = 44;

/** Hidden below `sm` — applied to the header and body cell of the same column. */
const SM_ONLY = "hidden sm:table-cell";

export function TimelineTable({ modelsByYear }: TimelineTableProps) {
  const parentRef = useRef<HTMLTableSectionElement>(null);
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
    estimateSize: (index) =>
      rows[index].type === "group" ? GROUP_ROW_HEIGHT : MODEL_ROW_HEIGHT,
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

  const virtualRows = virtualizer.getVirtualItems();
  // Spacer rows stand in for the rows above/below the window, so the real
  // <table> keeps its layout instead of needing absolutely-positioned rows.
  const paddingTop =
    virtualRows.length > 0 ? virtualRows[0].start - scrollMargin : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? virtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1].end - scrollMargin)
      : 0;

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="bg-[var(--rd-surface-2)]">
          <TableHead className="w-[34%] px-4 py-2.5 font-[family-name:var(--font-mono)] text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--rd-text-3)]">
            Model
          </TableHead>
          <TableHead className={`w-[26%] px-4 py-2.5 font-[family-name:var(--font-mono)] text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--rd-text-3)] ${SM_ONLY}`}>
            Organization
          </TableHead>
          <TableHead className={`w-[14%] px-4 py-2.5 font-[family-name:var(--font-mono)] text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--rd-text-3)] ${SM_ONLY}`}>
            Date
          </TableHead>
          <TableHead className="w-[13%] px-4 py-2.5 font-[family-name:var(--font-mono)] text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--rd-text-3)]">
            Params
          </TableHead>
          <TableHead className="w-[13%] px-4 py-2.5 font-[family-name:var(--font-mono)] text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--rd-text-3)]">
            License
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody ref={parentRef}>
        {paddingTop > 0 && (
          <tr>
            <td colSpan={5} style={{ height: paddingTop }} />
          </tr>
        )}

        {virtualRows.map((vrow) => {
          const row = rows[vrow.index];

          if (row.type === "group") {
            return (
              <TableRow key={row.key} className="bg-[var(--rd-bg)]">
                <TableCell
                  colSpan={5}
                  className="px-4 py-3"
                  style={{ height: GROUP_ROW_HEIGHT }}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg font-bold text-[var(--rd-text-2)]">
                      {row.year}
                    </span>
                    <span className="font-[family-name:var(--font-mono)] text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--rd-text-3)]">
                      {row.modelCount} model{row.modelCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          }

          const m = row.model;
          return (
            <TableRow
              key={row.key}
              className="transition-colors hover:bg-[var(--rd-surface-2)]"
              style={{ height: MODEL_ROW_HEIGHT }}
            >
              <TableCell className="truncate px-4 py-2.5 text-sm font-medium">
                {m.name}
              </TableCell>
              <TableCell
                className={`truncate px-4 py-2.5 text-sm text-[var(--rd-text-2)] ${SM_ONLY}`}
              >
                {m.org}
              </TableCell>
              <TableCell
                className={`px-4 py-2.5 font-[family-name:var(--font-mono)] text-xs text-[var(--rd-text-3)] ${SM_ONLY}`}
              >
                {m.date}
              </TableCell>
              <TableCell className="px-4 py-2.5 font-[family-name:var(--font-mono)] text-xs text-[var(--rd-text-3)]">
                {m.params || "—"}
              </TableCell>
              <TableCell className="px-4 py-2.5">
                <Badge variant={getLicenseBadgeVariant(m.license)}>
                  {m.license}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}

        {paddingBottom > 0 && (
          <tr>
            <td colSpan={5} style={{ height: paddingBottom }} />
          </tr>
        )}
      </TableBody>
    </Table>
  );
}
