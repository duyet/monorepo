'use client'

import { Search, X } from 'lucide-react'
import type { FilterState } from '@/lib/utils'
import { organizations } from '@/lib/data'

interface FiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  resultCount: number
}

export function Filters({ filters, onFilterChange, resultCount }: FiltersProps) {
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

  return (
    <div className="mb-8 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search models, organizations..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
        {filters.search && (
          <button
            onClick={() => updateFilter('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
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
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
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
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        >
          <option value="all">All Types</option>
          <option value="model">Models</option>
          <option value="milestone">Milestones</option>
        </select>

        {/* Organization Filter */}
        <select
          value={filters.org}
          onChange={(e) => updateFilter('org', e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
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
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}

        {/* Result Count */}
        <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
