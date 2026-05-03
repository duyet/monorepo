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
      className: "bg-[#fecaca] dark:bg-[#4f1f1f]",
    },
    {
      title: "Explore by Topics",
      href: "/tags",
      category: "Browse",
      description:
        "Discover content organized by technology, tools, and concepts.",
      tags: topTags,
      className: "bg-white dark:bg-[#1a1a1a]",
    },
    {
      title: "Series",
      href: "/series",
      category: "Deep Dives",
      description:
        "Comprehensive multi-part guides on specific topics and technologies.",
      tags: seriesList.map((series) => series.name),
      className: "bg-[#a7f3d0] dark:bg-[#164634]",
    },
  ];

  return (
    <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.href}
          to={card.href}
          className={`${card.className} group flex min-h-[180px] flex-col rounded-xl p-5 text-[#1a1a1a] transition-colors hover:bg-[#f2f2eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] dark:text-[#f8f8f2] dark:hover:bg-[#242420] dark:focus-visible:outline-[#f8f8f2] lg:p-6`}
        >
          <span className="text-sm font-medium text-[#1a1a1a]/60 dark:text-[#f8f8f2]/60">
            {card.category}
          </span>
          <h3 className="mt-5 text-lg font-semibold leading-tight tracking-tight md:text-xl">
            {card.title}
          </h3>
          <p className="mt-2 text-sm font-medium leading-snug text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
            {card.description}
          </p>
          {card.tags.length > 0 ? (
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              {card.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-white/70 px-2.5 py-1 text-xs font-medium text-[#1a1a1a]/65 dark:bg-white/10 dark:text-[#f8f8f2]/70"
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
