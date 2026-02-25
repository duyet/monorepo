'use client'

import { useState, useMemo, useEffect } from 'react'
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

export function StaticView({ models: allModels, stats, view, license, year, org }: StaticViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
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

  // Filter models based on search
  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return allModels

    const query = searchQuery.toLowerCase()
    return allModels.filter(model =>
      model.name.toLowerCase().includes(query) ||
      model.org.toLowerCase().includes(query) ||
      model.desc.toLowerCase().includes(query)
    )
  }, [allModels, searchQuery])

  const modelsByYear = groupByYear(filteredModels)
  const modelsByOrg = groupByOrg(filteredModels)

  return (
    <>
      {/* Stats Cards */}
      <StatsCards
        models={stats.models}
        organizations={stats.organizations}
        open={stats.open}
        activeView={view}
        activeLicense={license}
      />

      {/* Filter Info with Search */}
      <FilterInfo
        resultCount={filteredModels.length}
        view={view}
        license={license}
        year={year}
        org={org}
        liteMode={liteMode}
        models={allModels}
        onSearchChange={setSearchQuery}
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
