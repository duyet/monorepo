'use client'

import { Search, X, Rows2, LayoutList } from 'lucide-react'
import type { FilterState } from '@/lib/utils'
import { organizations } from '@/lib/data'

interface FiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  resultCount: number
  liteMode?: boolean
  onLiteModeToggle?: () => void
}

export function Filters({ filters, onFilterChange, resultCount, liteMode, onLiteModeToggle }: FiltersProps) {
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '',
      license: 'all',
      type: 'all',
      org: '',
    })
  }

  const hasActiveFilters =
    filters.search || filters.license !== 'all' || filters.type !== 'all' || filters.org

  const inputStyle = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  }

  const selectClassName =
    'rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 appearance-none cursor-pointer'

  return (
    <div className="mb-8 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          placeholder="Search models, organizations..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1"
          style={{
            ...inputStyle,
            // @ts-expect-error CSS custom properties
            '--tw-ring-color': 'var(--accent)',
          }}
        />
        {filters.search && (
          <button
            onClick={() => updateFilter('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* License Filter */}
        <select
          value={filters.license}
          onChange={(e) => updateFilter('license', e.target.value as FilterState['license'])}
          className={selectClassName}
          style={inputStyle}
        >
          <option value="all">All Licenses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="partial">Partial</option>
        </select>

        {/* Type Filter */}
        <select
          value={filters.type}
          onChange={(e) => updateFilter('type', e.target.value as FilterState['type'])}
          className={selectClassName}
          style={inputStyle}
        >
          <option value="all">All Types</option>
          <option value="model">Models</option>
          <option value="milestone">Milestones</option>
        </select>

        {/* Organization Filter */}
        <select
          value={filters.org}
          onChange={(e) => updateFilter('org', e.target.value)}
          className={selectClassName}
          style={inputStyle}
        >
          <option value="">All Organizations</option>
          {organizations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}

        {/* Result Count */}
        <span
          className="ml-auto text-sm"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          {resultCount.toLocaleString()} result{resultCount !== 1 ? 's' : ''}
        </span>

        {/* Lite Mode Toggle */}
        {onLiteModeToggle && (
          <button
            onClick={onLiteModeToggle}
            className="rounded-lg border p-1.5 transition-colors"
            style={{
              borderColor: liteMode ? 'var(--accent)' : 'var(--border)',
              backgroundColor: liteMode ? 'var(--accent-subtle)' : 'var(--bg-card)',
              color: liteMode ? 'var(--accent)' : 'var(--text-muted)',
            }}
            title={liteMode ? 'Switch to full view' : 'Switch to compact view'}
            aria-label={liteMode ? 'Switch to full view' : 'Switch to compact view'}
          >
            {liteMode ? <LayoutList className="h-4 w-4" /> : <Rows2 className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}
