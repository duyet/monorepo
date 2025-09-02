import { CompactMetric } from '@/components/ui/compact-metric'
import { Brain, Calendar, Database, DollarSign } from 'lucide-react'
import { getCCUsageMetrics } from './ccusage-utils'
import type { CCUsageMetricsProps } from './types'

function formatCurrency(amount: number): string {
  if (amount === 0) return '$0'
  if (amount < 0.01) return '<$0.01'
  if (amount < 1) return `$${amount.toFixed(2)}`
  if (amount < 10) return `$${amount.toFixed(1)}`
  return `$${Math.round(amount)}`
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return tokens.toString()
}

function formatModelName(modelName: string, maxLength: number = 15): string {
  if (modelName.length <= maxLength) return modelName
  return `${modelName.substring(0, maxLength)}...`
}

export async function CCUsageMetrics({ days = 30, className }: CCUsageMetricsProps) {
  const rawMetrics = await getCCUsageMetrics(days)
  
  if (!rawMetrics) {
    return (
      <div className={`text-center text-muted-foreground ${className || ''}`}>
        No metrics available
      </div>
    )
  }
  
  // Process metrics data with computed derived values (converted from hook)
  const metrics = {
    ...rawMetrics,
    // Add computed properties
    cacheEfficiency: rawMetrics.totalTokens > 0 ? (rawMetrics.cacheTokens / rawMetrics.totalTokens) * 100 : 0,
    averageCostPerToken: rawMetrics.totalTokens > 0 ? rawMetrics.totalCost / rawMetrics.totalTokens : 0,
    costPerDay: rawMetrics.activeDays > 0 ? rawMetrics.totalCost / rawMetrics.activeDays : 0,
  }

  return (
    <div className={`grid grid-cols-2 gap-4 lg:grid-cols-4 ${className || ''}`}>
      <CompactMetric
        label="Total Tokens"
        value={formatTokens(metrics.totalTokens)}
        icon={<Database className="h-4 w-4" />}
        change={metrics.totalTokens > 0 ? { value: 15 } : undefined}
      />
      <CompactMetric
        label="Total Cost"
        value={formatCurrency(metrics.totalCost)}
        icon={<DollarSign className="h-4 w-4" />}
        change={metrics.totalCost > 0 ? { value: 12 } : undefined}
      />
      <CompactMetric
        label="Active Days"
        value={metrics.activeDays.toString()}
        icon={<Calendar className="h-4 w-4" />}
        change={metrics.activeDays > 0 ? { value: 12 } : undefined}
      />
      <CompactMetric
        label="Top Model"
        value={formatModelName(metrics.topModel)}
        icon={<Brain className="h-4 w-4" />}
      />
    </div>
  )
}
