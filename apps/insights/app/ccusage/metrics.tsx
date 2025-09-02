import { CompactMetric } from '@/components/ui/compact-metric'
import { Brain, Calendar, Database, DollarSign } from 'lucide-react'
import { getCCUsageMetrics } from './ccusage-utils'
import { useFormattedCurrency, useModelNameFormatter, useProcessedMetrics } from './hooks'
import type { CCUsageMetricsProps } from './types'

export async function CCUsageMetrics({ days = 30, className }: CCUsageMetricsProps) {
  const rawMetrics = await getCCUsageMetrics(days)
  const { format: formatCurrency, formatTokens } = useFormattedCurrency()
  const formatModelName = useModelNameFormatter()
  const metrics = useProcessedMetrics(rawMetrics)
  
  if (!metrics) {
    return (
      <div className={`text-center text-muted-foreground ${className || ''}`}>
        <p>No metrics data available</p>
        <p className="mt-2 text-xs">Unable to load usage metrics</p>
      </div>
    )
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
