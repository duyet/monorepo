import { Timeline } from '@/components/timeline'
import { OrgTimeline } from '@/components/org-timeline'
import { FilterInfo } from '@/components/filter-info'
import { StatsCards } from '@/components/stats-cards'
import type { Model } from '@/lib/data'
import { groupByYear, groupByOrg } from '@/lib/utils'

type View = 'models' | 'organizations' | 'open'

interface StaticViewProps {
  models: Model[]
  stats: {
    models: number
    organizations: number
    open: number
  }
  view: View
  license?: 'all' | 'open' | 'closed' | 'partial'
  year?: number
  org?: string
  liteMode?: boolean
}

export function StaticView({ models, stats, view, license, year, org, liteMode }: StaticViewProps) {
  const modelsByYear = groupByYear(models)
  const modelsByOrg = groupByOrg(models)

  return (
    <>
      {/* Stats Cards */}
      <StatsCards
        models={stats.models}
        organizations={stats.organizations}
        open={stats.open}
        activeView={view}
      />

      {/* Filter Info */}
      <FilterInfo
        resultCount={models.length}
        view={view}
        license={license}
        year={year}
        org={org}
      />

      {/* Timeline */}
      <div className="min-h-[50vh]">
        {view === 'organizations' ? (
          <OrgTimeline modelsByOrg={modelsByOrg} liteMode={liteMode} />
        ) : (
          <Timeline modelsByYear={modelsByYear} liteMode={liteMode} />
        )}
      </div>
    </>
  )
}
