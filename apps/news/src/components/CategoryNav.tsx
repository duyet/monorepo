import { categoryLabel } from "../lib/lang";
import type { Lang } from "../lib/types";
import { useHorizontalScroll } from "../lib/use-horizontal-scroll";

export function CategoryNav({
  categories,
  selected,
  onToggle,
  lang,
}: {
  categories: { name: string; count: number }[];
  selected: Set<string>;
  onToggle: (name: string) => void;
  lang: Lang;
}) {
  const scrollRef = useHorizontalScroll<HTMLElement>();

  if (categories.length === 0) return null;

  return (
    <nav
      ref={scrollRef}
      className="edge-fade-x scrollbar-hide flex items-center gap-1.5 overflow-x-auto whitespace-nowrap border-b border-border py-2.5"
    >
      <button
        type="button"
        onClick={() => {
          for (const name of selected) onToggle(name);
        }}
        aria-pressed={selected.size === 0}
        className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold transition-colors ${
          selected.size === 0
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-muted"
        }`}
      >
        {lang === "vi" ? "Tất cả" : "All"}
      </button>
      {categories.map((c) => {
        const isSelected = selected.has(c.name);
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => onToggle(c.name)}
            aria-pressed={isSelected}
            className={`shrink-0 rounded-full px-3 py-1 text-sm transition-colors ${
              isSelected
                ? "bg-accent font-semibold text-accent-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {categoryLabel(c.name, lang)}{" "}
            <span className={isSelected ? "opacity-80" : "text-xs opacity-70"}>
              {c.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
