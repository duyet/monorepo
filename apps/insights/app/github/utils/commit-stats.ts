import { getWeekStart } from './date-helpers'
import { fetchAllEvents } from './github-api'
import type { CommitActivity, CommitStats } from './types'

/**
 * Get empty commit stats structure
 */
function getEmptyStats(): CommitStats {
  return {
    totalCommits: 0,
    avgCommitsPerWeek: 0,
    mostActiveDay: 'Monday',
    commitHistory: [],
  }
}

/**
 * Get commit statistics for a GitHub user
 */
export async function getCommitStats(owner: string): Promise<CommitStats> {
  console.log(`Fetching GitHub commit stats for ${owner}`)

  try {
    // Get user events with pagination to cover full 12 weeks
    const events = await fetchAllEvents(owner)

    // Filter push events (commits)
    const pushEvents = events.filter((event) => event.type === 'PushEvent')

    // Calculate commit statistics
    const commitsByWeek = new Map<string, number>()
    const commitsByDay = new Map<string, number>()
    let totalCommits = 0

    // Process last 12 weeks
    const now = new Date()
    const twelveWeeksAgo = new Date(
      now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000,
    )

    pushEvents.forEach((event) => {
      const eventDate = new Date(event.created_at)
      if (eventDate < twelveWeeksAgo) return

      const commits = event.payload?.commits?.length || 1
      totalCommits += commits

      // Group by week
      const weekStart = getWeekStart(eventDate)
      const weekKey = weekStart.toISOString().split('T')[0]
      commitsByWeek.set(weekKey, (commitsByWeek.get(weekKey) || 0) + commits)

      // Group by day of week
      const dayName = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
      })
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
        week: 12 - i,
      })
    }

    console.log(
      `Commit history generated for ${commitHistory.length} weeks, total commits: ${totalCommits}`,
    )

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
      avgCommitsPerWeek:
        commitHistory.length > 0 ? totalCommits / commitHistory.length : 0,
      mostActiveDay,
      commitHistory,
    }
  } catch (error) {
    console.error('Error fetching commit stats:', error)
    return getEmptyStats()
  }
}
