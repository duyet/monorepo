"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface CompactMetricProps {
  label: string
  value: string | number
  change?: {
    value: number
    label?: string
  }
  icon?: ReactNode
  className?: string
}

export function CompactMetric({ label, value, change, icon, className }: CompactMetricProps) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4 text-card-foreground",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-lg font-mono font-semibold tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center space-x-1">
              <span className={cn(
                "text-xs font-medium",
                change.value >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {change.value >= 0 ? "+" : ""}{change.value}%
              </span>
              {change.label && (
                <span className="text-xs text-muted-foreground">{change.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}