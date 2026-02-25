import Link from 'next/link'
import { Timeline } from '@/components/timeline'
import { OrgTimeline } from '@/components/org-timeline'
import { FilterInfo } from '@/components/filter-info'
import type { Model } from '@/lib/data'
import { groupByYear, groupByOrg } from '@/lib/utils'

type View = 'models' | 'organizations'

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
      {/* Stats Header - clickable links */}
      <div className="mb-8 flex flex-wrap items-center gap-4 text-sm">
        <Link
          href="/"
          className={`font-medium ${view === 'models' ? 'text-[var(--accent)]' : ''}`}
        >
          {stats.models.toLocaleString()} models
        </Link>
        <span style={{ color: 'var(--border)' }}>•</span>
        <Link
          href="/license/open"
          className={`${license === 'open' ? 'text-[var(--accent)]' : ''}`}
          style={{ color: license === 'open' ? undefined : 'var(--text-muted)' }}
        >
          {stats.open.toLocaleString()} open
        </Link>
        <span style={{ color: 'var(--border)' }}>•</span>
        <Link
          href="/year/2024"
          className="hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          By year
        </Link>
        <span style={{ color: 'var(--border)' }}>•</span>
        <Link
          href="/org/openai"
          className="hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          By org
        </Link>
      </div>

      {/* Filter Info */}
      <FilterInfo
        resultCount={models.length}
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
