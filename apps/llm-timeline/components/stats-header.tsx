import { Building2, Sparkles, LockOpen } from 'lucide-react'

type View = 'models' | 'organizations' | 'open'

interface StatsHeaderProps {
  models: number
  organizations: number
  open: number
  activeView: View
  onViewChange: (v: View) => void
}

export function StatsHeader({
  models,
  organizations,
  open,
  activeView,
  onViewChange,
}: StatsHeaderProps) {
  const stats: Array<{
    label: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    view?: View
  }> = [
    { label: 'Models', value: models, icon: Sparkles, view: 'models' },
    { label: 'Organizations', value: organizations, icon: Building2, view: 'organizations' },
    { label: 'Open Weights', value: open, icon: LockOpen, view: 'open' },
  ]

  return (
    <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, view }) => {
        const isActive = view !== undefined && activeView === view
        const isClickable = view !== undefined

        return (
          <div
            key={label}
            className="rounded-lg border p-4"
            style={{
              borderColor: isActive ? 'var(--accent)' : 'var(--border)',
              borderTopColor: isActive ? 'var(--accent)' : 'var(--accent)',
              borderTopWidth: '2px',
              backgroundColor: isActive ? 'var(--accent-subtle)' : 'var(--bg-card)',
              cursor: isClickable ? 'pointer' : 'default',
              transition: 'border-color 0.15s, background-color 0.15s',
            }}
            onClick={isClickable ? () => onViewChange(view) : undefined}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={
              isClickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') onViewChange(view)
                  }
                : undefined
            }
          >
            <div
              className="text-2xl font-semibold"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text)',
              }}
            >
              {value.toLocaleString()}
            </div>
            <div
              className="mt-1 flex items-center gap-1.5 text-xs uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              <Icon className="h-3 w-3" />
              {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
