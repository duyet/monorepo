import Link from 'next/link'
import { Building2, Sparkles, LockOpen } from 'lucide-react'

interface StatsCardsProps {
  models: number
  organizations: number
  open: number
  activeView?: 'models' | 'organizations' | 'open'
  activeLicense?: 'all' | 'open' | 'closed' | 'partial'
}

export function StatsCards({
  models,
  organizations,
  open,
  activeView,
  activeLicense,
}: StatsCardsProps) {
  const stats: Array<{
    label: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    href: string
    view: 'models' | 'organizations' | 'open'
  }> = [
    { label: 'Models', value: models, icon: Sparkles, href: '/', view: 'models' },
    { label: 'Organizations', value: organizations, icon: Building2, href: '/org', view: 'organizations' },
    { label: 'Open Weights', value: open, icon: LockOpen, href: '/license/open', view: 'open' },
  ]

  return (
    <div className="mb-8 grid grid-cols-3 gap-4">
      {stats.map(({ label, value, icon: Icon, href, view }) => {
        const isActive = activeView === view || (view === 'open' && activeLicense === 'open')

        return (
          <Link
            key={label}
            href={href}
            className="rounded-lg border p-4 transition-all hover:bg-muted hover:text-accent-foreground"
            style={{
              borderColor: isActive ? 'var(--primary)' : 'var(--border)',
              backgroundColor: isActive ? 'var(--accent)' : 'var(--card)',
            }}
          >
            {/* Number */}
            <div
              className="text-3xl font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text)',
              }}
            >
              {value.toLocaleString()}
            </div>

            {/* Label with icon */}
            <div
              className="mt-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
