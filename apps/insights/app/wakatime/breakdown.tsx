type BreakdownItem = {
  name: string;
  percent: number;
  total_seconds: number;
};

function formatHours(seconds: number): string {
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
      <p className="text-sm text-[color:var(--muted)]">{emptyLabel}</p>
    );
  }

  const max = Math.max(...items.map((i) => i.percent), 1);

  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li
          key={item.name}
          className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-[color:var(--hairline)] py-3 last:border-b-0"
        >
          <div className="min-w-0">
            <p className="text-sm text-[color:var(--foreground)] truncate">
              {item.name}
            </p>
            <div className="mt-1.5 h-[2px] w-full overflow-hidden bg-[color:var(--hairline)]">
              <div
                className="h-full bg-[color:var(--foreground)]"
                style={{ width: `${(item.percent / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="font-mono tabular-nums text-xs text-[color:var(--muted)]">
            {item.percent.toFixed(1)}%
          </span>
          <span className="font-mono tabular-nums text-xs text-[color:var(--muted)] w-12 text-right">
            {formatHours(item.total_seconds)}
          </span>
        </li>
      ))}
    </ul>
  );
}
