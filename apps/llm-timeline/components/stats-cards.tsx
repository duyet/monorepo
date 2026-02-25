import Link from 'next/link'
import { Building2, Sparkles, LockOpen } from 'lucide-react'

interface StatsCardsProps {
  models: number
  organizations: number
  open: number
  activeView?: 'models' | 'organizations' | 'open'
}

export function StatsCards({
  models,
  organizations,
  open,
  activeView,
}: StatsCardsProps) {
  const stats: Array<{
    label: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    href: string
    view: 'models' | 'organizations' | 'open'
  }> = [
    { label: 'Models', value: models, icon: Sparkles, href: '/', view: 'models' },
    { label: 'Organizations', value: organizations, icon: Building2, href: '/org/openai', view: 'organizations' },
    { label: 'Open Weights', value: open, icon: LockOpen, href: '/license/open', view: 'open' },
  ]

  return (
    <div className="mb-8 grid grid-cols-3 gap-4">
      {stats.map(({ label, value, icon: Icon, href, view }) => {
        const isActive = activeView === view

        return (
          <Link
            key={label}
            href={href}
            className="relative overflow-hidden rounded-lg border-2 border-t-0 p-4 transition-all hover:shadow-md"
            style={{
              borderColor: 'var(--border)',
              borderTopColor: 'var(--accent)',
              backgroundColor: 'var(--bg-card)',
              opacity: isActive ? 1 : 0.9,
            }}
          >
            {/* Accent top border */}
            <div
              className="absolute left-0 right-0 top-0 h-1"
              style={{ backgroundColor: 'var(--accent)' }}
            />

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
