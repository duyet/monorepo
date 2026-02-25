import Link from 'next/link'
import { organizations } from '@/lib/data'
import { slugify } from '@/lib/utils'

type View = 'models' | 'organizations' | 'open'

interface FilterInfoProps {
  resultCount: number
  view: View
  license?: 'all' | 'open' | 'closed' | 'partial'
  year?: number
  org?: string
}

export function FilterInfo({ resultCount, view, license, year, org }: FilterInfoProps) {
  const licenseLabel = {
    all: 'All Licenses',
    open: 'Open Source',
    closed: 'Closed Source',
    partial: 'Partial',
  }[license || 'all']

  const viewLabel = {
    models: 'Models',
    organizations: 'Organizations',
    open: 'Open',
  }[view]

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 rounded-lg border p-4" style={{
      borderColor: 'var(--border)',
      backgroundColor: 'var(--bg-card)',
    }}>
      {/* Result Count */}
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
        <span className="font-semibold" style={{ color: 'var(--text)' }}>
          {resultCount.toLocaleString()}
        </span>
        {' '}{view === 'organizations' ? 'organizations' : 'models'}
      </span>

      {/* Active view indicator for organizations view */}
      {view === 'organizations' && (
        <>
          <span style={{ color: 'var(--border)' }}>•</span>
          <span className="text-sm" style={{ color: 'var(--accent)' }}>
            Grouped by organization
          </span>
        </>
      )}

      {/* Active filters */}
      {year && (
        <>
          <span style={{ color: 'var(--border)' }}>•</span>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            {year} ×
          </Link>
        </>
      )}

      {org && (
        <>
          <span style={{ color: 'var(--border)' }}>•</span>
          <Link
            href="/org"
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            {org} ×
          </Link>
        </>
      )}

      {license && license !== 'all' && (
        <>
          <span style={{ color: 'var(--border)' }}>•</span>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            {licenseLabel} ×
          </Link>
        </>
      )}

      {/* Quick links */}
      <span className="ml-auto flex gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <Link href="/" className={view === 'models' ? 'text-[var(--accent)]' : 'hover:opacity-70'}>Timeline</Link>
        <span>•</span>
        <Link href="/org" className={view === 'organizations' ? 'text-[var(--accent)]' : 'hover:opacity-70'}>By Org</Link>
        <span>•</span>
        <Link href="/license/open" className={license === 'open' ? 'text-[var(--accent)]' : 'hover:opacity-70'}>Open</Link>
        <span>•</span>
        <Link href="/lite" className="hover:opacity-70">Lite</Link>
      </span>
    </div>
  )
}
