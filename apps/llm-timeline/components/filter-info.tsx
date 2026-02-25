'use client'

import Link from 'next/link'
import { List, Search } from 'lucide-react'
import { useState } from 'react'
import type { Model } from '@/lib/data'

type View = 'models' | 'organizations' | 'open'

interface FilterInfoProps {
  resultCount: number
  view: View
  license?: 'all' | 'open' | 'closed' | 'partial'
  year?: number
  org?: string
  liteMode?: boolean
  models: Model[]
  onSearchChange?: (query: string) => void
}

export function FilterInfo({ resultCount, view, license, year, org, liteMode, models, onSearchChange }: FilterInfoProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearchChange?.(value)
  }

  return (
    <div className="mb-8 flex items-center gap-4 rounded-lg border px-4 py-3" style={{
      borderColor: 'var(--border)',
      backgroundColor: 'var(--bg-card)',
    }}>
      {/* Search input */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search models..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--bg)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Result Count */}
      <span className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
        <span className="font-semibold" style={{ color: 'var(--text)' }}>
          {resultCount.toLocaleString()}
        </span>
        {' '}{view === 'organizations' ? 'organizations' : 'models'}
      </span>

      {/* Lite mode toggle icon */}
      <Link
        href="/lite"
        className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        title="Switch to lite mode"
      >
        <List className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
      </Link>
    </div>
  )
}
