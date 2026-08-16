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
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <TrendingUp className="h-4 w-4 text-accent" aria-hidden />
        {label}
      </span>
      {trending.map((t) => (
        <span
          key={t.tag}
          className="flex items-baseline gap-1.5 rounded-full border border-border px-3 py-1 text-sm"
        >
          {t.tag}
          <span className="text-xs font-semibold text-accent">{t.count}</span>
        </span>
      ))}
    </div>
  );
}
