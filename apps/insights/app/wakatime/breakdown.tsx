import type { ReactNode } from "react";
import type { WakaTimeBreakdown } from "./wakatime-utils";

interface BreakdownViewProps {
  title: string;
  description: string;
  data: WakaTimeBreakdown[];
  icon?: ReactNode;
  emptyMessage?: string;
}

const CHART_COLOR_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatHours(hours: number): string {
  if (hours >= 1) return `${hours.toFixed(1)}h`;
  const minutes = Math.round(hours * 60);
  return `${minutes}m`;
}

export function WakaTimeBreakdownView({
  title,
  description,
  data,
  icon,
  emptyMessage = "No data available for this period.",
}: BreakdownViewProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-[color:var(--hairline)] bg-[var(--surface-card)] p-6">
        <div className="mb-2 flex items-center gap-2">
          {icon ? (
            <span className="text-[color:var(--muted)]">{icon}</span>
          ) : null}
          <h3 className="font-medium text-[var(--foreground)]">{title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="mt-6 text-sm italic text-[color:var(--muted)]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const maxPercent = Math.max(...data.map((d) => d.percent));

  return (
    <div className="rounded-xl border border-[color:var(--hairline)] bg-[var(--surface-card)] p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon ? (
          <span className="text-[color:var(--muted)]">{icon}</span>
        ) : null}
        <h3 className="font-medium text-[var(--foreground)]">{title}</h3>
      </div>
      <p className="mb-5 text-xs text-muted-foreground">{description}</p>

      <ul className="space-y-3">
        {data.map((item, index) => {
          const widthPercent =
            maxPercent > 0 ? (item.percent / maxPercent) * 100 : 0;
          const color = CHART_COLOR_VARS[index % CHART_COLOR_VARS.length];

          return (
            <li key={`${item.name}-${index}`} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                    style={{ background: color }}
                  />
                  <span className="truncate font-medium text-[var(--foreground)]">
                    {item.name}
                  </span>
                </span>
                <span className="flex flex-shrink-0 items-baseline gap-2 font-mono text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    {formatHours(item.hours)}
                  </span>
                  <span className="tabular-nums text-[color:var(--muted)]">
                    {item.percent.toFixed(1)}%
                  </span>
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--hairline)]"
                aria-hidden
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${widthPercent}%`,
                    background: color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Retained for compatibility with other master modules if any
type BreakdownItem = {
  name: string;
  percent: number;
  total_seconds: number;
};

function formatHoursFromSeconds(seconds: number): string {
  const hours = seconds / 3600;
  if (hours >= 10) return `${Math.round(hours)}h`;
  if (hours >= 1) return `${hours.toFixed(1)}h`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}

export function WakaTimeBreakdownList({
  items,
  emptyLabel = "No data available",
}: {
  items: BreakdownItem[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{emptyLabel}</p>
    );
  }

  const max = Math.max(...items.map((i) => i.percent), 1);

  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li
          key={item.name}
          className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b py-3 last:border-b-0"
        >
          <div className="min-w-0">
            <p className="text-sm truncate">
              {item.name}
            </p>
            <div className="mt-1.5 h-[2px] w-full overflow-hidden bg-border">
              <div
                className="h-full bg-foreground"
                style={{ width: `${(item.percent / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="font-mono tabular-nums text-xs text-muted-foreground">
            {item.percent.toFixed(1)}%
          </span>
          <span className="font-mono tabular-nums text-xs text-muted-foreground w-12 text-right">
            {formatHoursFromSeconds(item.total_seconds)}
          </span>
        </li>
      ))}
    </ul>
  );
}
