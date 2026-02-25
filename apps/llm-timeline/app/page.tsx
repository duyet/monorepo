import Link from 'next/link'
import { Github } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { StaticView } from '@/components/static-view'
import { models, lastSynced, years } from '@/lib/data'
import { getStats, groupByYear } from '@/lib/utils'

// Computed once at build time — not inside component to avoid re-computation
const stats = getStats(models)
const firstYear = years[years.length - 1]
const latestYear = years[0]
const modelsByYear = groupByYear(models)

export default function LLMTimelinePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text)',
                }}
              >
                LLM Timeline
              </h1>
              <p
                className="mt-1 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Interactive timeline of Large Language Model releases ({firstYear}–{latestYear})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="https://github.com/duyet/monorepo"
                target="_blank"
                className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                style={{ color: 'var(--text-muted)' }}
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Static View - fully pre-rendered */}
        <StaticView
          models={models}
          stats={stats}
          view="models"
          license="all"
        />

        {/* Footer */}
        <footer
          className="mt-12 border-t pt-8 text-center text-sm"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <p>
            Built by{' '}
            <Link
              href="https://duyet.net"
              className="underline"
              style={{ color: 'var(--text)' }}
            >
              duyet
            </Link>
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            Data from{' '}
            <Link
              href="https://lifearchitect.ai/models-table"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              LifeArchitect.AI Models Table
            </Link>
            {' '}·{' '}
            <Link
              href="/llms.txt"
              className="underline hover:opacity-80"
            >
              llms.txt
            </Link>
            {' '}· Last updated:{' '}
            <span style={{ fontFamily: 'var(--font-mono)' }}>{lastSynced}</span>
          </p>
        </footer>
      </div>
    </div>
  )
}
