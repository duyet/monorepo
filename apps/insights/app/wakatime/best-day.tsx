import { Trophy } from "lucide-react";
import type { WakaTimeBestDayInsight } from "./wakatime-utils";

interface BestDayProps {
  bestDay: WakaTimeBestDayInsight | null;
  periodLabel?: string;
}

function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WakaTimeBestDayCard({ bestDay, periodLabel }: BestDayProps) {
  if (!bestDay) {
    return null;
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[color:var(--hairline)] p-6"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--chart-1) 14%, transparent), color-mix(in srgb, var(--chart-3) 8%, transparent))",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--chart-1)" }}
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[color:var(--hairline)]"
            style={{
              background:
                "color-mix(in srgb, var(--surface-card) 70%, transparent)",
            }}
          >
            <Trophy className="h-6 w-6 text-[color:var(--chart-1)]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Best coding day{periodLabel ? ` · ${periodLabel}` : ""}
            </p>
            <p className="mt-1 font-sans font-medium text-xl tracking-tight text-[var(--foreground)] sm:text-2xl">
              {formatDate(bestDay.date)}
            </p>
            {bestDay.text ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {bestDay.text}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-start gap-0.5 sm:items-end">
          <span className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
            {bestDay.hours.toFixed(1)}
            <span className="ml-1 text-base font-normal text-muted-foreground">
              hrs
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            Personal peak in this window
          </span>
        </div>
      </div>
    </div>
  );
}
