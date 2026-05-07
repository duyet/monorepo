import type { Series } from "@duyet/interfaces";
import { Link } from "@tanstack/react-router";

interface HomeCardsProps {
  seriesList: Series[];
  topTags: string[];
}

const CARD_SURFACES = [
  "bg-[#f3eee6] dark:bg-[#1f3a5f]",
  "bg-[#bfdbfe] dark:bg-[#1f3a5f]",
  "bg-[#a7f3d0] dark:bg-[#164634]",
  "bg-[#fecaca] dark:bg-[#4f1f1f]",
];

export function HomeCards({ seriesList, topTags }: HomeCardsProps) {
  const cards = [
    {
      title: "Featured Posts",
      href: "/featured",
      category: "Highlights",
      description:
        "Explore my most popular and impactful articles on data engineering, software architecture, and technology insights.",
      tags: [],
    },
    {
      title: "Explore by Topics",
      href: "/tags",
      category: "Browse",
      description:
        "Discover content organized by technology, tools, and concepts.",
      tags: topTags,
    },
    {
      title: "Series",
      href: "/series",
      category: "Deep Dives",
      description:
        "Comprehensive multi-part guides on specific topics and technologies.",
      tags: seriesList.map((series) => series.name),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {cards.map((card, index) => (
        <Link
          key={card.href}
          to={card.href}
          className={`surface-card-base ${CARD_SURFACES[index % CARD_SURFACES.length]} group flex min-h-[180px] flex-col p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] lg:p-6`}
        >
          <span className="text-sm font-medium text-[#1a1a1a]/65 dark:text-[#f8f8f2]/65">
            {card.category}
          </span>
          <h3 className="mt-5 text-lg font-semibold leading-tight tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] md:text-xl">
            {card.title}
          </h3>
          <p className="mt-2 text-sm font-medium leading-snug text-[#1a1a1a]/80 dark:text-[#f8f8f2]/80">
            {card.description}
          </p>
          {card.tags.length > 0 ? (
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              {card.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-[#1a1a1a]/20 bg-[#1a1a1a]/8 px-2.5 py-1 text-xs font-medium text-[#1a1a1a]/85 dark:border-white/20 dark:bg-white/8 dark:text-[#f8f8f2]/85"
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
