import { PageLayout } from '@/components/page-layout'
import { StaticView } from '@/components/static-view'
import { models } from '@/lib/data'
import { getStats } from '@/lib/utils'

export const metadata = {
  title: 'Organizations | LLM Timeline',
  description: 'All LLM models grouped by organization.',
  alternates: {
    canonical: 'https://llm-timeline.duyet.net/org',
  },
}

const stats = getStats(models)

export default function OrgsPage() {
  return (
    <PageLayout title="Organizations" description="All LLM models grouped by organization">
      <StaticView
        models={models}
        stats={stats}
        view="organizations"
        license="all"
      />
    </PageLayout>
  )
}
