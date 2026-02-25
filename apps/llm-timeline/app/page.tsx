import Link from 'next/link'
import { Github } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { StatsHeader } from '@/components/stats-header'
import { TimelineClient } from '@/components/timeline-client'
import { models, lastSynced, years } from '@/lib/data'
import { getStats } from '@/lib/utils'

// Computed once at build time — not inside component to avoid re-computation
const stats = getStats(models)
const firstYear = years[years.length - 1]
const latestYear = years[0]

export default function LLMTimelinePage() {
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
                Interactive timeline of Large Language Model releases ({firstYear}–{latestYear})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
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

        {/* Interactive: Filters + Timeline */}
        <TimelineClient />

        {/* Footer */}
        <footer className="mt-12 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          <p>
            Built by{' '}
            <Link href="https://duyet.net" className="text-neutral-700 underline dark:text-neutral-300">
              duyet
            </Link>
          </p>
          <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
            Data from{' '}
            <Link
              href="https://lifearchitect.ai/models-table"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              LifeArchitect.AI Models Table
            </Link>
            {' '}· Last updated: {lastSynced}
          </p>
        </footer>
      </div>
    </div>
  )
}
