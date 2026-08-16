interface DailyBarsProps {
  data: { date: string; count: number }[];
  emptyLabel: string;
  formatValue?: (n: number) => string;
}

/** Vertical time-series bars, single accent hue, rounded data-ends, native tooltips. */
export function DailyBars({ data, emptyLabel, formatValue }: DailyBarsProps) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  const max = Math.max(...data.map((d) => d.count), 1);
  const fmt = formatValue ?? ((n: number) => String(n));
  return (
    <div className="flex h-28 items-end gap-1">
      {data.map((d) => (
        <div
          key={d.date}
          className="group relative flex flex-1 flex-col items-center justify-end"
          title={`${d.date}: ${fmt(d.count)}`}
        >
          <div
            className="w-full rounded-t-sm bg-accent transition-opacity group-hover:opacity-80"
            style={{
              height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 1)}%`,
            }}
          />
          <span className="mt-1 -rotate-45 whitespace-nowrap text-[9px] text-muted-foreground">
            {d.date.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}
