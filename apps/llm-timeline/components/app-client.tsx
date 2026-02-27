'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Filters } from '@/components/filters'
import { Timeline } from '@/components/timeline'
import { OrgTimeline } from '@/components/org-timeline'
import { StatsHeader } from '@/components/stats-header'
import { filterModels, groupByYear, groupByOrg, type FilterState } from '@/lib/utils'
import type { Model } from '@/lib/data'

type View = 'models' | 'organizations'

interface AppClientProps {
  initialModels: Model[]
  stats: {
    models: number
    organizations: number
  }
  initialView?: View
  initialLicense?: FilterState['license']
  initialLiteMode?: boolean
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  license: 'all',
  type: 'all',
  org: '',
  source: 'all',
  domain: 'all',
  params: 'all',
}

// ============================================================================
// StaticAppClient - For static routes (org/year/license pages)
// NO URL hooks, so no Suspense boundary needed, renders instantly
// ============================================================================
export function StaticAppClient({
  initialModels,
  stats,
  initialView = 'models',
  initialLicense = 'all',
  initialLiteMode = false,
}: AppClientProps) {
  const [view, setView] = useState<View>(initialView)
  const [liteMode, setLiteMode] = useState(initialLiteMode)
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    license: initialLicense,
  })
  const [isPending, startTransition] = useTransition()

  const handleFilterChange = (next: FilterState) => {
    startTransition(() => setFilters(next))
  }

  const handleViewChange = (nextView: View) => {
    setView(nextView)
  }

  const filteredModels = useMemo(
    () => filterModels(initialModels, filters),
    [initialModels, filters]
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

// ============================================================================
// AppClient - For main page with URL sync
// Uses useSearchParams, requires Suspense boundary
// ============================================================================

export function AppClient({
  initialModels,
  stats,
  initialView = 'models',
  initialLicense = 'all',
  initialLiteMode = false,
}: AppClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [view, setView] = useState<View>(initialView)
  const [liteMode, setLiteMode] = useState(initialLiteMode)
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    license: initialLicense,
  })
  const [isPending, startTransition] = useTransition()

  // Sync initial state with URL params on mount
  useEffect(() => {
    const urlView = (searchParams.get('view') as View) || initialView
    const urlLicense = (searchParams.get('license') as FilterState['license']) || initialLicense
    const urlLiteMode = searchParams.get('lite') === 'true'
    const urlSearch = searchParams.get('search') || ''
    const urlType = (searchParams.get('type') as FilterState['type']) || 'all'
    const urlOrg = searchParams.get('org') || ''

    setView(urlView)
    setLiteMode(urlLiteMode)
    setFilters({
      search: urlSearch,
      license: urlLicense,
      type: urlType,
      org: urlOrg,
      source: (searchParams.get('source') as FilterState['source']) || 'all',
      domain: searchParams.get('domain') || 'all',
      params: searchParams.get('params') || 'all',
    })
  }, [searchParams, initialView, initialLicense])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (view !== 'models') params.set('view', view)
    if (filters.license !== 'all') params.set('license', filters.license)
    if (liteMode) params.set('lite', 'true')
    if (filters.search) params.set('search', filters.search)
    if (filters.type !== 'all') params.set('type', filters.type)
    if (filters.org) params.set('org', filters.org)
    if (filters.source !== 'all') params.set('source', filters.source)
    if (filters.domain !== 'all') params.set('domain', filters.domain)
    if (filters.params !== 'all') params.set('params', filters.params)

    const queryString = params.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname

    router.replace(url)
  }, [view, filters, liteMode, pathname, router])

  const handleFilterChange = (next: FilterState) => {
    startTransition(() => setFilters(next))
  }

  const handleViewChange = (nextView: View) => {
    setView(nextView)
  }

  const filteredModels = useMemo(
    () => filterModels(initialModels, filters),
    [initialModels, filters]
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
