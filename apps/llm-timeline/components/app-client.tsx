'use client'

import { useState, useMemo, useTransition } from 'react'
import { Filters } from '@/components/filters'
import { Timeline } from '@/components/timeline'
import { OrgTimeline } from '@/components/org-timeline'
import { StatsHeader } from '@/components/stats-header'
import { models } from '@/lib/data'
import { filterModels, groupByYear, groupByOrg, type FilterState } from '@/lib/utils'

type View = 'models' | 'organizations' | 'open'

interface AppClientProps {
  stats: {
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

  const handleViewChange = (nextView: View) => {
    setView(nextView)
    // Reset license filter when switching away from 'open' view
    if (nextView !== 'open' && filters.license === 'open') {
      startTransition(() => setFilters((prev) => ({ ...prev, license: 'all' })))
    }
  }

  // When in 'open' view, override license filter to 'open'
  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      license: view === 'open' ? 'open' : filters.license,
    }),
    [filters, view]
  )

  const filteredModels = useMemo(
    () => filterModels(models, effectiveFilters),
    [effectiveFilters]
  )
  const modelsByYear = useMemo(() => groupByYear(filteredModels), [filteredModels])
  const modelsByOrg = useMemo(() => groupByOrg(filteredModels), [filteredModels])

  return (
    <>
      <StatsHeader
        {...stats}
        activeView={view}
        onViewChange={handleViewChange}
      />
      <div className={isPending ? 'opacity-70 transition-opacity' : ''}>
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          resultCount={filteredModels.length}
          liteMode={liteMode}
          onLiteModeToggle={() => setLiteMode((prev) => !prev)}
        />
        {view === 'organizations' ? (
          <OrgTimeline modelsByOrg={modelsByOrg} liteMode={liteMode} />
        ) : (
          <Timeline modelsByYear={modelsByYear} liteMode={liteMode} />
        )}
      </div>
    </>
  )
}
