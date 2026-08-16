import { TrendingUp } from "lucide-react";

export function TrendingChips({
  trending,
  label,
}: {
  trending: { tag: string; count: number }[];
  label: string;
}) {
  if (trending.length === 0) return null;
  return (
    <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto whitespace-nowrap py-3">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <TrendingUp className="h-4 w-4 text-accent" aria-hidden />
        {label}
      </span>
      {trending.map((t) => (
        <span
          key={t.tag}
          className="flex shrink-0 items-baseline gap-1.5 rounded-full border border-border px-3 py-1 text-sm"
        >
          {t.tag}
          <span className="text-xs font-semibold text-accent">{t.count}</span>
        </span>
      ))}
    </div>
  );
}
