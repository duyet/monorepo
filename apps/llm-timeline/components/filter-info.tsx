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

  return (
    <div className="mb-8 flex items-center justify-between rounded-lg border px-4 py-3" style={{
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

      {/* Quick links */}
      <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <Link href="/license/open" className="hover:opacity-70">Open</Link>
        <span>•</span>
        <Link href="/year/2024" className="hover:opacity-70">2024</Link>
        <span>•</span>
        <Link href="/lite" className="hover:opacity-70">Lite</Link>
      </span>
    </div>
  )
}
