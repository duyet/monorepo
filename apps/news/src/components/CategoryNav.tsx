import { Link } from "@tanstack/react-router";
import { categoryLabel } from "../lib/lang";
import type { Lang } from "../lib/types";

export function CategoryNav({
  categories,
  active,
  lang,
}: {
  categories: { name: string; count: number }[];
  active?: string;
  lang: Lang;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border py-3 text-sm">
      {categories.map((c) => {
        const slug = c.name.toLowerCase();
        const isActive = active === slug;
        return (
          <Link
            key={c.name}
            to="/category/$slug"
            params={{ slug }}
            className={`flex items-baseline gap-1 hover:text-accent ${
              isActive ? "font-bold text-accent" : "font-medium"
            }`}
          >
            {categoryLabel(c.name, lang)}
            <span className="text-xs text-muted-foreground">{c.count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
