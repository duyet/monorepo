import type { Series } from '@duyet/interfaces'
import { ContentCard } from './content-card'
import { FeaturedCard } from './featured-card'

interface HomeCardsProps {
  seriesList: Series[]
  topTags: string[]
}

export function HomeCards({ seriesList, topTags }: HomeCardsProps) {
  return (
    <div className="mb-16 flex flex-col gap-6">
      <FeaturedCard
        title="Featured Posts"
        href="/featured"
        category="Highlights"
        description="Explore my most popular and impactful articles on data engineering, software architecture, and technology insights."
        color="terracotta"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ContentCard
          title="Explore by Topics"
          href="/tags"
          category="Browse"
          description="Discover content organized by technology, tools, and concepts."
          tags={topTags}
          color="oat"
          illustration="geometric"
        />

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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ContentCard
          title="Latest Posts"
          href="/feed"
          category="Recent"
          description="Stay updated with my newest articles and insights."
          color="cream"
          illustration="blob"
        />

        <ContentCard
          title="Archives"
          href="/archives"
          category="History"
          description="Browse through years of technical content and learning."
          color="ivory"
          illustration="geometric"
        />

        <ContentCard
          title="About Me"
          href="/about"
          category="Profile"
          description="Learn more about my journey in technology and data engineering."
          color="lavender"
          illustration="wavy"
        />
      </div>
    </div>
  )
}
