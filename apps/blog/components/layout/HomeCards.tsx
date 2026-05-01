import type { Series } from "@duyet/interfaces";
import { Link } from "@tanstack/react-router";

interface HomeCardsProps {
  seriesList: Series[];
  topTags: string[];
}

export function HomeCards({ seriesList, topTags }: HomeCardsProps) {
  const cards = [
    {
      title: "Featured Posts",
      href: "/featured",
      category: "Highlights",
      description:
        "Explore my most popular and impactful articles on data engineering, software architecture, and technology insights.",
      tags: [],
      className: "bg-red-50 dark:bg-red-950/30",
    },
    {
      title: "Explore by Topics",
      href: "/tags",
      category: "Browse",
      description:
        "Discover content organized by technology, tools, and concepts.",
      tags: topTags,
      className: "bg-stone-100 dark:bg-stone-900",
    },
    {
      title: "Series",
      href: "/series",
      category: "Deep Dives",
      description:
        "Comprehensive multi-part guides on specific topics and technologies.",
      tags: seriesList.map((series) => series.name),
      className: "bg-emerald-50 dark:bg-emerald-950/30",
    },
  ];

  return (
    <div className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.href}
          to={card.href}
          className={`${card.className} group flex min-h-[220px] flex-col rounded-xl border border-neutral-950/10 p-5 text-neutral-950 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:border-white/10 dark:text-neutral-50 dark:focus-visible:outline-neutral-50 md:min-h-[240px] md:p-6 lg:p-7`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-neutral-400">
            {card.category}
          </span>
          <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight">
            {card.title}
          </h3>
          <p className="mt-4 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            {card.description}
          </p>
          {card.tags.length > 0 ? (
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              {card.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-neutral-700 dark:bg-white/10 dark:text-neutral-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
