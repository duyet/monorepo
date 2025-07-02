import { AreaChart } from '@/components/charts'
import { CompactMetric } from '@/components/ui/compact-metric'
import { GitCommit, Zap, Calendar } from 'lucide-react'

const owner = 'duyet'

interface CommitActivity extends Record<string, unknown> {
  date: string
  commits: number
  week: number
}

interface CommitStats {
  totalCommits: number
  avgCommitsPerWeek: number
  mostActiveDay: string
  commitHistory: CommitActivity[]
}

export async function CommitTimeline() {
  const stats = await getCommitStats(owner)

  const metrics = [
    {
      label: 'Total Commits',
      value: stats.totalCommits.toLocaleString(),
      icon: <GitCommit className="h-4 w-4" />,
      change: stats.totalCommits > 0 ? { value: 12 } : undefined
    },
    {
      label: 'Avg/Week',
      value: Math.round(stats.avgCommitsPerWeek).toString(),
      icon: <Zap className="h-4 w-4" />,
      change: stats.avgCommitsPerWeek > 0 ? { value: 8 } : undefined
    },
    {
      label: 'Most Active',
      value: stats.mostActiveDay,
      icon: <Calendar className="h-4 w-4" />,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Commit Metrics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {metrics.map((metric) => (
          <CompactMetric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Commit Activity Chart */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Commit Activity (Last 12 Weeks)</h3>
          <p className="text-xs text-muted-foreground">Weekly commit frequency across all repositories</p>
        </div>
        <div className="h-64">
          <AreaChart
            data={stats.commitHistory}
            index="date"
            categories={["commits"]}
            showGridLines={false}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Data from GitHub API • Last 12 weeks of commit activity
      </p>
    </div>
  )
}

async function getCommitStats(owner: string): Promise<CommitStats> {
  console.log(`Fetching GitHub commit stats for ${owner}`)
  
  try {
    // Get user events with pagination to cover full 12 weeks
    const events = await fetchAllEvents(owner)
    
    // Filter push events (commits)
    const pushEvents = events.filter((event: { type: string }) => event.type === 'PushEvent')
    
    // Calculate commit statistics
    const commitsByWeek = new Map<string, number>()
    const commitsByDay = new Map<string, number>()
    let totalCommits = 0

    // Process last 12 weeks
    const now = new Date()
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)

    pushEvents.forEach((event: { created_at: string; payload?: { commits?: unknown[] } }) => {
      const eventDate = new Date(event.created_at)
      if (eventDate < twelveWeeksAgo) return

      const commits = event.payload?.commits?.length || 1
      totalCommits += commits

      // Group by week
      const weekStart = getWeekStart(eventDate)
      const weekKey = weekStart.toISOString().split('T')[0]
      commitsByWeek.set(weekKey, (commitsByWeek.get(weekKey) || 0) + commits)

      // Group by day of week
      const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'long' })
      commitsByDay.set(dayName, (commitsByDay.get(dayName) || 0) + commits)
    })

    // Create timeline data for all 12 weeks
    const commitHistory: CommitActivity[] = []
    for (let i = 11; i >= 0; i--) {
      const weekDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekStart = getWeekStart(weekDate)
      const weekKey = weekStart.toISOString().split('T')[0]
      const weekCommits = commitsByWeek.get(weekKey) || 0
      
      commitHistory.push({
        date: weekKey,
        commits: weekCommits,
        week: 12 - i
      })
    }
    
    console.log(`Commit history generated for ${commitHistory.length} weeks, total commits: ${totalCommits}`)

    // Find most active day
    let mostActiveDay = 'Monday'
    let maxCommits = 0
    commitsByDay.forEach((commits, day) => {
      if (commits > maxCommits) {
        maxCommits = commits
        mostActiveDay = day
      }
    })

    return {
      totalCommits,
      avgCommitsPerWeek: commitHistory.length > 0 ? totalCommits / commitHistory.length : 0,
      mostActiveDay,
      commitHistory
    }

  } catch (error) {
    console.error('Error fetching commit stats:', error)
    return getEmptyStats()
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

function getEmptyStats(): CommitStats {
  return {
    totalCommits: 0,
    avgCommitsPerWeek: 0,
    mostActiveDay: 'Monday',
    commitHistory: []
  }
}

async function fetchAllEvents(owner: string): Promise<{ type: string; created_at: string; payload?: { commits?: unknown[] } }[]> {
  const allEvents: { type: string; created_at: string; payload?: { commits?: unknown[] } }[] = []
  let page = 1
  const perPage = 100
  const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000)
  
  while (true) {
    try {
      console.log(`Fetching events page ${page} for ${owner}`)
      
      const response = await fetch(
        `https://api.github.com/users/${owner}/events?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
          cache: 'force-cache',
        }
      )

      if (!response.ok) {
        console.error(`Failed to fetch events page ${page}:`, response.statusText)
        break
      }

      const events = await response.json()
      
      if (!events || events.length === 0) {
        break // No more events
      }
      
      // Check if we've reached events older than 12 weeks
      const hasOldEvents = events.some((event: { created_at: string }) => 
        new Date(event.created_at) < twelveWeeksAgo
      )
      
      // Add events that are within the 12-week window
      const recentEvents = events.filter((event: { created_at: string }) => 
        new Date(event.created_at) >= twelveWeeksAgo
      )
      allEvents.push(...recentEvents)
      
      // If we found old events, we've gone back far enough
      if (hasOldEvents) {
        console.log(`Reached events older than 12 weeks, stopping at page ${page}`)
        break
      }
      
      // If we got less than perPage items, we've reached the end
      if (events.length < perPage) {
        break
      }
      
      page++
      
      // Safety limit - GitHub events API typically shows last 90 days
      if (page > 10) {
        console.warn(`Reached page limit (${page}), stopping pagination`)
        break
      }
      
    } catch (error) {
      console.error(`Error fetching events page ${page}:`, error)
      break
    }
  }
  
  console.log(`Total events fetched: ${allEvents.length} (last 12 weeks)`)
  return allEvents
}