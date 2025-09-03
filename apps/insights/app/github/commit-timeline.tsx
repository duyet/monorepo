import { getCommitStats } from './utils/commit-stats'
import { CommitMetrics, CommitChart } from './components'

const owner = 'duyet'

export async function CommitTimeline() {
  const stats = await getCommitStats(owner)

  return (
    <div className="space-y-6">
      {/* Commit Metrics */}
      <CommitMetrics stats={stats} />

      {/* Commit Activity Chart */}
      <CommitChart stats={stats} />

      <p className="text-xs text-muted-foreground">
        Data from GitHub API • Last 12 weeks of commit activity
      </p>
    </div>
  )
}
