import { Calendar, Building2, Sparkles, LockOpen } from 'lucide-react'

interface StatsHeaderProps {
  total: number
  models: number
  milestones: number
  organizations: number
  open: number
}

export function StatsHeader({
  total,
  models,
  milestones,
  organizations,
  open,
}: StatsHeaderProps) {
  const stats = [
    { label: 'Total', value: total, icon: Sparkles },
    { label: 'Models', value: models, icon: Sparkles },
    { label: 'Milestones', value: milestones, icon: Calendar },
    { label: 'Organizations', value: organizations, icon: Building2 },
    { label: 'Open Weights', value: open, icon: LockOpen },
  ]

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <Icon className="h-4 w-4 text-neutral-400" />
          <div>
            <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {value}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
