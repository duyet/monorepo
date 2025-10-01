import { AreaChart } from '@/components/charts'
import type { CommitStats } from '../utils/types'

interface CommitChartProps {
  stats: CommitStats
}

export function CommitChart({ stats }: CommitChartProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h3 className="font-medium">Commit Activity (Last 12 Weeks)</h3>
        <p className="text-xs text-muted-foreground">
          Weekly commit frequency across all repositories
        </p>
      </div>
      <div className="h-64">
        <AreaChart
          data={stats.commitHistory}
          index="date"
          categories={['commits']}
          showGridLines={false}
        />
      </div>
    </div>
  )
}
