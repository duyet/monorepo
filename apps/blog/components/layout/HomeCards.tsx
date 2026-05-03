import type { Series } from "@duyet/interfaces";
import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";

interface HomeCardsProps {
  seriesList: Series[];
  topTags: string[];
}

const CARD_BG_COLORS = Array.from({ length: 100 }, (_, index) => {
  const hue = (index * 37) % 360;
  const saturation = 72 - (index % 5) * 4;
  const lightness = 88 - (index % 4) * 5;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
});

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
          style={
            {
              "--card-bg": CARD_BG_COLORS[
                hashString(`${card.href}:${card.title}:${card.category}:${index}`)
              ],
              "--card-bg-dark": `hsl(${(index * 77 + 196) % 360} 36% 17%)`,
            } as CSSProperties
          }
          className="group flex min-h-[180px] flex-col rounded-xl border border-[#1a1a1a]/10 bg-[var(--card-bg)] p-5 text-[#1a1a1a] shadow-[0_16px_36px_rgba(15,23,42,0.05)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] dark:border-white/10 dark:bg-[var(--card-bg-dark)] dark:text-[#f8f8f2] dark:focus-visible:outline-[#f8f8f2] lg:p-6"
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
                  className="rounded-lg bg-white/75 px-2.5 py-1 text-xs font-medium text-[#1a1a1a]/65 dark:bg-white/10 dark:text-[#f8f8f2]/70"
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

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}
