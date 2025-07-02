import { CompactMetric } from '@/components/ui/compact-metric'
import { Star, GitFork, TrendingUp, Eye } from 'lucide-react'

const owner = 'duyet'

interface RepoTrend {
  name: string
  stars: number
  forks: number
  watchers: number
  updated: string
  language: string
  size: number
}

interface TrendStats {
  totalStars: number
  totalForks: number
  totalWatchers: number
  topRepos: RepoTrend[]
  trendingRepos: RepoTrend[]
}

export async function RepoTrends() {
  const stats = await getTrendStats(owner)

  const metrics = [
    {
      label: 'Total Stars',
      value: stats.totalStars.toLocaleString(),
      icon: <Star className="h-4 w-4" />,
      change: stats.totalStars > 0 ? { value: 15 } : undefined
    },
    {
      label: 'Total Forks',
      value: stats.totalForks.toLocaleString(),
      icon: <GitFork className="h-4 w-4" />,
      change: stats.totalForks > 0 ? { value: 8 } : undefined
    },
    {
      label: 'Watchers',
      value: stats.totalWatchers.toLocaleString(),
      icon: <Eye className="h-4 w-4" />,
      change: stats.totalWatchers > 0 ? { value: 12 } : undefined
    },
  ]

  return (
    <div className="space-y-6">
      {/* Repository Metrics */}
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

      {/* Top Repositories */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Most Starred */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4">
            <h3 className="font-medium">Most Starred Repositories</h3>
            <p className="text-xs text-muted-foreground">Top repositories by star count</p>
          </div>
          <div className="space-y-3">
            {stats.topRepos.slice(0, 5).map((repo, index) => (
              <div key={repo.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-xs font-mono w-4 text-center text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{repo.name}</p>
                    <p className="text-xs text-muted-foreground">{repo.language}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>{repo.stars}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GitFork className="h-3 w-3" />
                    <span>{repo.forks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Updated */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4">
            <h3 className="font-medium">Recently Updated</h3>
            <p className="text-xs text-muted-foreground">Most recently active repositories</p>
          </div>
          <div className="space-y-3">
            {stats.trendingRepos.slice(0, 5).map((repo, index) => (
              <div key={repo.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-xs font-mono w-4 text-center text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{repo.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(repo.updated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>{repo.stars}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{Math.round(repo.size / 1024)}KB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Data from GitHub API • Repository statistics and trends
      </p>
    </div>
  )
}

async function getTrendStats(owner: string): Promise<TrendStats> {
  console.log(`Fetching GitHub trend stats for ${owner}`)
  
  try {
    // Fetch all repositories
    const reposResponse = await fetch(
      `https://api.github.com/search/repositories?q=user:${owner}+is:public&sort=updated&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
        cache: 'force-cache',
      }
    )

    if (!reposResponse.ok) {
      console.error('Failed to fetch repositories:', reposResponse.statusText)
      return getEmptyTrendStats()
    }

    const reposData = await reposResponse.json()
    const repos = reposData.items || [] // Already filtered for public repos in the query

    // Convert to trend data
    const repoTrends: RepoTrend[] = repos
      .map((repo: { 
        name: string; 
        stargazers_count?: number; 
        forks_count?: number; 
        watchers_count?: number; 
        updated_at: string; 
        language?: string; 
        size?: number 
      }) => ({
        name: repo.name,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        watchers: repo.watchers_count || 0,
        updated: repo.updated_at,
        language: repo.language || 'Unknown',
        size: repo.size || 0
      }))

    // Calculate totals
    const totalStars = repoTrends.reduce((sum, repo) => sum + repo.stars, 0)
    const totalForks = repoTrends.reduce((sum, repo) => sum + repo.forks, 0)
    const totalWatchers = repoTrends.reduce((sum, repo) => sum + repo.watchers, 0)

    // Sort by stars for top repos
    const topRepos = [...repoTrends].sort((a, b) => b.stars - a.stars)

    // Sort by recent updates for trending
    const trendingRepos = [...repoTrends].sort((a, b) => 
      new Date(b.updated).getTime() - new Date(a.updated).getTime()
    )

    return {
      totalStars,
      totalForks,
      totalWatchers,
      topRepos,
      trendingRepos
    }

  } catch (error) {
    console.error('Error fetching trend stats:', error)
    return getEmptyTrendStats()
  }
}

function getEmptyTrendStats(): TrendStats {
  return {
    totalStars: 0,
    totalForks: 0,
    totalWatchers: 0,
    topRepos: [],
    trendingRepos: []
  }
}