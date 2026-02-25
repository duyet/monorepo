'use client'

import { useState, useMemo, useTransition } from 'react'
import { Filters } from '@/components/filters'
import { Timeline } from '@/components/timeline'
import { OrgTimeline } from '@/components/org-timeline'
import { StatsHeader } from '@/components/stats-header'
import { models } from '@/lib/data'
import { filterModels, groupByYear, groupByOrg, type FilterState } from '@/lib/utils'

type View = 'models' | 'organizations'

interface AppClientProps {
  stats: {
    total: number
    models: number
    organizations: number
    open: number
  }
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  license: 'all',
  type: 'all',
  org: '',
}

export function AppClient({ stats }: AppClientProps) {
  const [view, setView] = useState<View>('models')
  const [liteMode, setLiteMode] = useState(false)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [isPending, startTransition] = useTransition()

  const handleFilterChange = (next: FilterState) => {
    startTransition(() => setFilters(next))
  }

  const filteredModels = useMemo(() => filterModels(models, filters), [filters])
  const modelsByYear = useMemo(() => groupByYear(filteredModels), [filteredModels])
  const modelsByOrg = useMemo(() => groupByOrg(filteredModels), [filteredModels])

  return (
    <>
      <StatsHeader
        {...stats}
        activeView={view}
        onViewChange={(v) => setView(v)}
      />
      <div className={isPending ? 'opacity-70 transition-opacity' : ''}>
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          resultCount={filteredModels.length}
          liteMode={liteMode}
          onLiteModeToggle={() => setLiteMode((prev) => !prev)}
        />
        {view === 'models' ? (
          <Timeline modelsByYear={modelsByYear} liteMode={liteMode} />
        ) : (
          <OrgTimeline modelsByOrg={modelsByOrg} liteMode={liteMode} />
        )}
      </div>
    </>
  )
}
