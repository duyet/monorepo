import { AreaChart } from '@/components/charts'
import { getCCUsageCosts } from './ccusage-utils'
<<<<<<< HEAD
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
=======
import type { CCUsageCostsProps, CostChartData } from './types'

function formatCurrency(amount: number): string {
  if (amount === 0) return '$0'
  if (amount < 0.01) return '<$0.01'
  if (amount < 1) return `$${amount.toFixed(2)}`
  if (amount < 10) return `$${amount.toFixed(1)}`
  return `$${Math.round(amount)}`
}

export async function CCUsageCosts({ days = 30, className }: CCUsageCostsProps) {
  const costs = await getCCUsageCosts(days)
  
  // Process cost data with summary calculations (converted from hook)
  const total = costs.reduce((sum, day) => sum + day['Total Cost'], 0)
  const average = costs.length > 0 ? total / costs.length : 0
  const projected = average * 30 // Monthly projection
  const summary = { total, average, projected }
  
  // Transform cost data for charts (converted from hook)
  const costChartData: CostChartData[] = costs.map((row) => ({
    date: row.date,
    'Input Cost': row['Input Cost'],
    'Output Cost': row['Output Cost'],
    'Cache Cost': row['Cache Cost'],
  }))
  
>>>>>>> origin/master

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