import { AiFeaturedCard, ContentCard } from "@duyet/components";
import type { Series } from "@duyet/interfaces";

interface HomeCardsProps {
  seriesList: Series[];
  topTags: string[];
}

export function HomeCards({ seriesList, topTags }: HomeCardsProps) {
  return (
    <div className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="[&>*]:h-full [&_h2]:text-2xl [&_h3]:text-2xl [&_p]:text-sm">
        <AiFeaturedCard
          title="Featured Posts"
          href="/featured"
          category="Highlights"
          fallbackDescription="Explore my most popular and impactful articles on data engineering, software architecture, and technology insights."
          color="terracotta"
          cardType="featured"
        />
      </div>

      <div className="[&>*]:h-full [&_h2]:text-2xl [&_h3]:text-2xl [&_p]:text-sm">
        <ContentCard
          title="Explore by Topics"
          href="/tags"
          category="Browse"
          description="Discover content organized by technology, tools, and concepts."
          tags={topTags}
          color="oat"
          illustration="geometric"
        />
      </div>

      <div className="[&>*]:h-full [&_h2]:text-2xl [&_h3]:text-2xl [&_p]:text-sm">
        <ContentCard
          title="Series"
          href="/series"
          category="Deep Dives"
          description="Comprehensive multi-part guides on specific topics and technologies."
          tags={seriesList.map((s) => s.name)}
          color="sage"
          illustration="wavy"
        />
      </div>
    </div>
  );
}
