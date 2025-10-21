'use client'

import { cn } from '@duyet/libs'
import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  change?: {
    value: number
    label: string
  }
  icon?: ReactNode
  className?: string
}

export function MetricCard({
  title,
  value,
  description,
  change,
  icon,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-card p-6 text-card-foreground',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {change && (
              <span
                className={cn(
                  'rounded-full px-2 py-1 text-xs font-medium',
                  change.value >= 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
                )}
              >
                {change.value >= 0 ? '+' : ''}
                {change.value}% {change.label}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && <div className="text-muted-foreground/60 h-6 w-6">{icon}</div>}
      </div>
    </div>
  )
}
