import { AreaChart } from '@/components/charts'
import { getCCUsageEfficiency } from './ccusage-utils'

export async function CCUsageEfficiency() {
  const efficiency = await getCCUsageEfficiency()

  if (!efficiency || efficiency.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No efficiency data available</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Cost efficiency trends will appear here once usage data is available
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h3 className="font-medium">Usage Efficiency</h3>
        <p className="text-xs text-muted-foreground">
          Token utilization efficiency over time (higher is better)
        </p>
      </div>
      <AreaChart
        categories={['Efficiency Score']}
        data={efficiency}
        index="date"
      />
      <div className="mt-3 text-xs text-muted-foreground">
        Efficiency score represents tokens generated per unit cost. Values are
        relative and privacy-safe.
      </div>
    </div>
  )
}
