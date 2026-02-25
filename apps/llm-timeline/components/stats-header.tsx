import { Building2, Sparkles, LockOpen } from 'lucide-react'

interface StatsHeaderProps {
  total: number
  models: number
  organizations: number
  open: number
}

export function StatsHeader({
  total,
  models,
  organizations,
  open,
}: StatsHeaderProps) {
  const stats = [
    { label: 'Total', value: total, icon: Sparkles },
    { label: 'Models', value: models, icon: Sparkles },
    { label: 'Organizations', value: organizations, icon: Building2 },
    { label: 'Open Weights', value: open, icon: LockOpen },
  ]

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-lg border p-4"
          style={{
            borderColor: 'var(--border)',
            borderTopColor: 'var(--accent)',
            borderTopWidth: '2px',
            backgroundColor: 'var(--bg-card)',
          }}
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
      ))}
    </div>
  )
}
