import { TokenBarChart } from '@/components/charts/TokenBarChart'
import { CostBarChart } from '@/components/charts/CostBarChart'
import { getCCUsageActivity } from './ccusage-utils'
import type { CCUsageActivityProps } from './types'

export async function CCUsageActivity({ days = 30, className }: CCUsageActivityProps) {
  const activity = await getCCUsageActivity(days)
  
  if (!activity.length) {
    return (
      <div className={`rounded-lg border bg-card p-8 text-center ${className || ''}`}>
        <p className="text-muted-foreground">No activity data available</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Daily usage activity will appear here once data is available
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Token Usage Chart */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Token Usage Trend</h3>
          <p className="text-xs text-muted-foreground">
            Daily Claude Code token usage (in thousands)
          </p>
        </div>
        <TokenBarChart
          categories={['Input Tokens', 'Output Tokens', 'Cache Tokens']}
          data={activity}
          index="date"
          stack={true}
          showInThousands={true}
        />
        <div className="mt-3 text-xs text-muted-foreground">
          Data shows tokens in thousands (K). Cache tokens represent prompt
          caching usage.
        </div>
      </div>

      {/* Cost Per Day Chart */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Daily Cost Trend ($)</h3>
          <p className="text-xs text-muted-foreground">
            Daily spending on Claude Code usage in USD
          </p>
        </div>
        <CostBarChart
          categories={['Total Cost']}
          data={activity}
          index="date"
          stack={false}
        />
        <div className="mt-3 text-xs text-muted-foreground">
          Cost in USD based on actual token consumption and pricing.
        </div>
      </div>
    </div>
  )
}
