"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

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

export function MetricCard({ title, value, description, change, icon, className }: MetricCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm",
      "hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {change && (
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                change.value >= 0 
                  ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950" 
                  : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950"
              )}>
                {change.value >= 0 ? "+" : ""}{change.value}% {change.label}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div className="h-6 w-6 text-muted-foreground/60">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}