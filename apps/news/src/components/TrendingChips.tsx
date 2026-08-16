import { TrendingUp } from "lucide-react";
import type { CSSProperties } from "react";
import { topicColor } from "../lib/topic-color";

export function TrendingChips({
  trending,
  label,
  selectedTag,
  onSelectTag,
}: {
  trending: { tag: string; count: number }[];
  label: string;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}) {
  if (trending.length === 0) return null;
  return (
    <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto whitespace-nowrap py-3">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <TrendingUp className="h-4 w-4 text-accent" aria-hidden />
        {label}
      </span>
      {trending.map((t) => {
        const selected =
          selectedTag !== null &&
          selectedTag.toLowerCase() === t.tag.toLowerCase();
        const color = topicColor(t.tag);
        return (
          <button
            key={t.tag}
            type="button"
            onClick={() => onSelectTag(selected ? null : t.tag)}
            aria-pressed={selected}
            className={`flex shrink-0 items-baseline gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
              selected
                ? "border-accent text-accent"
                : "border-border hover:border-accent/60"
            }`}
          >
            <span
              className="topic-colored h-1.5 w-1.5 shrink-0 self-center rounded-full bg-current"
              style={
                {
                  "--tc-light": color.light,
                  "--tc-dark": color.dark,
                } as CSSProperties
              }
              aria-hidden
            />
            {t.tag}
            <span className="text-xs font-semibold text-accent">{t.count}</span>
          </button>
        );
      })}
    </div>
  );
}
