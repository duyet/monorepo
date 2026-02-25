import { AppClient } from '@/components/app-client'
import { models } from '@/lib/data'
import { filterModels, groupByYear, groupByOrg, getStats, slugify, type FilterState } from '@/lib/utils'
import type { Model } from '@/lib/data'

type View = 'models' | 'organizations' | 'open'

interface TimelinePageProps {
  view?: View
  license?: 'all' | 'open' | 'closed' | 'partial'
  year?: number
  orgSlug?: string
  liteMode?: boolean
}

export function TimelinePage({
  view = 'models',
  license = 'all',
  year,
  orgSlug,
  liteMode = false,
}: TimelinePageProps) {
  // Build filter state from props
  const baseFilters: FilterState = {
    search: '',
    license: view === 'open' ? 'open' : license,
    type: 'all',
    org: '',
  }

  // Apply year filter if specified
  let filtered = filterModels(models, baseFilters)
  if (year) {
    filtered = filtered.filter(model => new Date(model.date).getFullYear() === year)
  }

  // Apply org filter if orgSlug is specified
  if (orgSlug) {
    // Find the org name by matching slug
    const orgs = Array.from(new Set(models.map(m => m.org)))
    const matchedOrg = orgs.find(org => slugify(org) === orgSlug)
    if (matchedOrg) {
      filtered = filtered.filter(model => model.org === matchedOrg)
    }
  }

  // Calculate stats from filtered models
  const statsResult = getStats(filtered)
  const stats = {
    models: statsResult.models,
    organizations: statsResult.organizations,
    open: statsResult.open,
  }

  return (
    <AppClient
      initialModels={filtered}
      initialView={view}
      initialLicense={license}
      initialLiteMode={liteMode}
      stats={stats}
    />
  )
}
