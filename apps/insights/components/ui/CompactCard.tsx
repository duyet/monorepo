'use client'

import { cn } from '../../lib/utils'
import { ReactNode } from 'react'

interface CompactCardProps {
  title?: string
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md'
  hover?: boolean
  header?: ReactNode
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
}

export function CompactCard({
  title,
  children,
  className,
  padding = 'md',
  hover = true,
  header,
}: CompactCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm',
        hover && 'transition-shadow duration-200 hover:shadow-md',
        className,
      )}
    >
      {(title || header) && (
        <div className={cn(
          'border-b px-4 py-3',
          padding === 'none' && 'px-3 py-2'
        )}>
          {header || (
            <h3 className="text-sm font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: {
    value: number
    label?: string
    period?: string
  }
  icon?: ReactNode
  className?: string
  compact?: boolean
}

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  icon,
  className,
  compact = false,
}: StatsCardProps) {
  return (
    <CompactCard
      className={className}
      padding={compact ? 'sm' : 'md'}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0 flex-1">
          <p className={cn(
            "font-medium text-muted-foreground",
            compact ? "text-xs" : "text-sm"
          )}>
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <p className={cn(
              "font-bold tracking-tight",
              compact ? "text-lg" : "text-2xl"
            )}>
              {value}
            </p>
            {change && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  change.value >= 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
                )}
              >
                {change.value >= 0 ? '+' : ''}
                {change.value}%
                {change.label && ` ${change.label}`}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={cn(
              "text-muted-foreground",
              compact ? "text-xs" : "text-sm"
            )}>
              {subtitle}
            </p>
          )}
          {change?.period && (
            <p className="text-xs text-muted-foreground">
              vs. {change.period}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "text-muted-foreground/60 shrink-0",
            compact ? "h-4 w-4" : "h-5 w-5"
          )}>
            {icon}
          </div>
        )}
      </div>
    </CompactCard>
  )
}