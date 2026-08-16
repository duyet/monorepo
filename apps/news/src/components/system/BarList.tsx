interface BarListProps {
  data: { name: string; count: number }[];
  emptyLabel: string;
}

/** Horizontal magnitude bars, single accent hue, direct value labels. */
export function BarList({ data, emptyLabel }: BarListProps) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <ul className="flex flex-col gap-2">
      {data.map((d) => (
        <li key={d.name} className="flex items-center gap-2">
          <span
            className="w-24 shrink-0 truncate text-xs text-muted-foreground"
            title={d.name}
          >
            {d.name}
          </span>
          <span className="h-2 flex-1 rounded-full bg-muted">
            <span
              className="block h-2 rounded-full bg-accent"
              style={{ width: `${Math.max((d.count / max) * 100, 3)}%` }}
              title={`${d.name}: ${d.count}`}
            />
          </span>
          <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-foreground">
            {d.count}
          </span>
        </li>
      ))}
    </ul>
  );
}
