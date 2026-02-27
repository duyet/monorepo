'use client'

import { useState, useMemo, useEffect } from 'react'
import { Timeline } from '@/components/timeline'
import { OrgTimeline } from '@/components/org-timeline'
import { FilterInfo } from '@/components/filter-info'
import { StatsCards } from '@/components/stats-cards'
import type { Model } from '@/lib/data'
import { groupByYear, groupByOrg, filterModels, type FilterState } from '@/lib/utils'

type View = 'models' | 'organizations'

interface StaticViewProps {
  models: Model[]
  stats: {
    models: number
    organizations: number
  }
  sourceStats?: {
    curated: number
    epoch: number
  }
  view: View
  license?: 'all' | 'open' | 'closed' | 'partial'
  year?: number
  org?: string
  liteMode?: boolean
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  license: 'all',
  type: 'all',
  org: '',
  source: 'all',
}

export function StaticView({ models: allModels, stats, sourceStats, view, license = 'all', year, org }: StaticViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'open' | 'closed' | 'partial'>(license)
  const [liteMode, setLiteMode] = useState(false)

  // Read lite mode and search from URL on mount
  useEffect(() => {
    const updateFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const initialSearch = params.get('search') || ''
      const isLite = params.get('lite') === '1'
      setSearchQuery(initialSearch)
      setLiteMode(isLite)
    }

    updateFromUrl()
    window.addEventListener('popstate', updateFromUrl)
    return () => window.removeEventListener('popstate', updateFromUrl)
  }, [])

  // Filter models based on search and license
  const filteredModels = useMemo(() => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      search: searchQuery,
      license: licenseFilter,
    }
    return filterModels(allModels, filters)
  }, [allModels, searchQuery, licenseFilter])

  const modelsByYear = groupByYear(filteredModels)
  const modelsByOrg = groupByOrg(filteredModels)

  return (
    <>
      {/* Stats Cards */}
      <StatsCards
        models={stats.models}
        organizations={stats.organizations}
        activeView={view}
        sourceStats={sourceStats}
      />

      {/* Filter Info with Search */}
      <FilterInfo
        resultCount={filteredModels.length}
        view={view}
        license={licenseFilter}
        year={year}
        org={org}
        liteMode={liteMode}
        models={allModels}
        onSearchChange={setSearchQuery}
        onLicenseChange={setLicenseFilter}
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
