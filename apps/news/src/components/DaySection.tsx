import { categoryLabel, formatDayHeading } from "../lib/lang";
import type { DayGroup, Lang } from "../lib/types";
import { StoryRow } from "./StoryRow";

export function DaySection({ day, lang }: { day: DayGroup; lang: Lang }) {
  const counts = Object.entries(day.categoryCounts).sort((a, b) => b[1] - a[1]);
  const shown = counts.slice(0, 7);
  const more = counts.length - shown.length;

  return (
    <section className="pt-8">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border pb-2">
        <h2 className="font-serif text-2xl tracking-tight">
          {formatDayHeading(day.date, lang)}
        </h2>
        <span className="text-xs text-muted-foreground">
          {day.items.length}{" "}
          {lang === "vi" ? "tin" : day.items.length === 1 ? "story" : "stories"}
        </span>
        <span className="hidden flex-wrap gap-x-3 text-xs text-muted-foreground md:flex">
          {shown.map(([name, count]) => (
            <span key={name}>
              {categoryLabel(name, lang)}{" "}
              <span className="font-semibold">{count}</span>
            </span>
          ))}
          {more > 0 && <span>+{more} more</span>}
        </span>
      </div>
      <div>
        {day.items.map((item, i) => (
          <StoryRow
            key={item.id}
            item={item}
            index={i + 1}
            lang={lang}
            hot={i === 0 && item.rank_score > 0 && day.items.length > 1}
          />
        ))}
      </div>
    </section>
  );
}
