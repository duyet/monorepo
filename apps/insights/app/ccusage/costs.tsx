import { AreaChart } from '@/components/charts'
import { getCCUsageCosts } from './ccusage-utils'
import { useFormattedCurrency, useProcessedCosts, useCostChartData, usePerformanceMonitor } from './hooks'
import type { CCUsageCostsProps } from './types'

export async function CCUsageCosts({ days = 30, className }: CCUsageCostsProps) {
  const rawCosts = await getCCUsageCosts(days)
  const { format: formatCurrency } = useFormattedCurrency()
  const { data: costs, summary } = useProcessedCosts(rawCosts)
  const costChartData = useCostChartData(costs)
  const { logRenderTime } = usePerformanceMonitor('CCUsageCosts', costs.length)
  
  // Log performance for large datasets
  if (costs.length > 90) {
    logRenderTime()
  }

  if (!costs || costs.length === 0) {
    return (
      <div className={`rounded-lg border bg-card p-8 text-center ${className || ''}`}>
        <p className="text-muted-foreground">No cost data available</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Daily cost breakdown will appear here once usage data is available
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Cost Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
          <p className="text-xs text-muted-foreground">
            Total ({typeof days === 'number' ? `${days} days` : 'all time'})
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{formatCurrency(summary.average)}</div>
          <p className="text-xs text-muted-foreground">Daily Average</p>
        </div>
        <div className="rounded-lg border bg-card p-4 lg:col-span-1 col-span-2">
          <div className="text-2xl font-bold">
            {formatCurrency(summary.projected)}
          </div>
          <p className="text-xs text-muted-foreground">
            Monthly Projection
          </p>
        </div>
      </div>

      {/* Cost Chart */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Daily Cost Breakdown</h3>
          <p className="text-xs text-muted-foreground">
            Cost breakdown by token type over the last 30 days
          </p>
        </div>
        <AreaChart
          categories={['Input Cost', 'Output Cost', 'Cache Cost']}
          data={costChartData}
          index="date"
          showGridLines={true}
        />
        <div className="mt-3 text-xs text-muted-foreground">
          Costs are based on actual Claude Code usage and token consumption
        </div>
      </div>
    </div>
  )
}