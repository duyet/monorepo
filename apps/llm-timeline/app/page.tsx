import { PageLayout } from '@/components/page-layout'
import { StaticView } from '@/components/static-view'
import { models, years } from '@/lib/data'
import { getStats } from '@/lib/utils'

// Computed once at build time — not inside component to avoid re-computation
const stats = getStats(models)
const firstYear = years[years.length - 1]
const latestYear = years[0]

export default function LLMTimelinePage() {
  return (
    <PageLayout description={`Interactive timeline of Large Language Model releases (${firstYear}–${latestYear})`}>
      <StaticView
        models={models}
        stats={stats}
        view="models"
        license="all"
      />
    </PageLayout>
  )
}
