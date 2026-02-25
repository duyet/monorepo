'use client'

import { useState, useMemo } from 'react'
import { Github, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Filters } from '@/components/filters'
import { StatsHeader } from '@/components/stats-header'
import { Timeline } from '@/components/timeline'
import { models } from '@/lib/data'
import { filterModels, groupByYear, getStats, type FilterState } from '@/lib/utils'
import Link from 'next/link'

export default function LLMTimelinePage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    license: 'all',
    type: 'all',
    org: '',
  })
  const { theme, setTheme } = useTheme()

  // Filter and group models
  const filteredModels = useMemo(() => filterModels(models, filters), [filters])
  const modelsByYear = useMemo(() => groupByYear(filteredModels), [filteredModels])
  const stats = useMemo(() => getStats(models), [])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                LLM Timeline
              </h1>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                Interactive timeline of Large Language Model releases (2017-2025)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <Link
                href="https://github.com/duyet/monorepo"
                target="_blank"
                className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Stats */}
        <StatsHeader {...stats} />

        {/* Filters */}
        <Filters
          filters={filters}
          onFilterChange={setFilters}
          resultCount={filteredModels.length}
        />

        {/* Timeline */}
        <Timeline modelsByYear={modelsByYear} />

        {/* Footer */}
        <footer className="mt-12 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          <p>
            Built by{' '}
            <Link
              href="https://duyet.net"
              className="text-neutral-700 underline dark:text-neutral-300"
            >
              duyet
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
