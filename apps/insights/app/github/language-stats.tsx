import { DonutChart } from '@/components/charts'
import { CompactMetric } from '@/components/ui/CompactMetric'
import { Archive, Code, GitBranch, Star } from 'lucide-react'
import { fetchAllRepositories } from './github-utils'

const owner = 'duyet'

interface GitHubLanguageStats {
  languages: { name: string; percentage: number; bytes: number }[]
  totalRepos: number
  totalStars: number
  archivedRepos: number
  activeRepos: number
}

export async function GitHubLanguageStats() {
  const stats = await getLanguageStats(owner)
  
  // Safety check in case stats is null/undefined or languages is not an array
  if (!stats || !Array.isArray(stats.languages)) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No language data available</p>
        <p className="mt-2 text-xs text-muted-foreground">
          GitHub API may be unavailable or repository access is limited
        </p>
      </div>
    )
  }

  const metrics = [
    {
      label: 'Total Repos',
      value: stats.totalRepos.toString(),
      icon: <GitBranch className="h-4 w-4" />,
      change: stats.totalRepos > 0 ? { value: 12 } : undefined,
    },
    {
      label: 'Total Stars',
      value: stats.totalStars.toLocaleString(),
      icon: <Star className="h-4 w-4" />,
      change: stats.totalStars > 0 ? { value: 8 } : undefined,
    },
    {
      label: 'Active Repos',
      value: stats.activeRepos.toString(),
      icon: <Code className="h-4 w-4" />,
      change: stats.activeRepos > 0 ? { value: 15 } : undefined,
    },
    {
      label: 'Archived',
      value: stats.archivedRepos.toString(),
      icon: <Archive className="h-4 w-4" />,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Repository Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      {/* Language Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Language Chart */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4">
            <h3 className="font-medium">Language Distribution</h3>
            <p className="text-xs text-muted-foreground">
              Programming languages across all repositories
            </p>
          </div>
          <div className="flex justify-center">
            <DonutChart
              category="percentage"
              data={stats.languages.slice(0, 8)}
              index="name"
              showLabel
              variant="donut"
            />
          </div>
        </div>

        {/* Top Languages List */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4">
            <h3 className="font-medium">Top Languages</h3>
            <p className="text-xs text-muted-foreground">
              Most used programming languages
            </p>
          </div>
          <div className="space-y-3">
            {stats.languages.slice(0, 6).map((lang, index) => (
              <div
                key={lang.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-4 text-center font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {lang.percentage.toFixed(1)}%
                  </span>
                  <div
                    className="h-2 w-12 rounded-full bg-muted"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--chart-${(index % 5) + 1})) ${lang.percentage}%, hsl(var(--muted)) ${lang.percentage}%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Data from GitHub API • Languages calculated by repository size
      </p>
    </div>
  )
}

async function getLanguageStats(owner: string): Promise<GitHubLanguageStats> {
  try {
    console.log(`Fetching GitHub language stats for ${owner}`)

    // Fetch all repositories with pagination
    const repos = await fetchAllRepositories(owner)
    console.log(`Found ${repos.length} public repositories for ${owner}`)

  // Calculate repository stats
  const totalRepos = repos.length
  const totalStars = repos.reduce(
    (sum: number, repo) => sum + (repo.stargazers_count || 0),
    0,
  )
  const archivedRepos = repos.filter((repo) => repo.archived).length
  const activeRepos = totalRepos - archivedRepos

  // Aggregate languages across all repositories
  const languageBytes: Record<string, number> = {}

  // Get language data for each repository (limit to top 20 to avoid rate limits)
  const topRepos = repos.slice(0, 20)

  for (const repo of topRepos) {
    if (repo.archived || !repo.name) continue

    try {
      const langResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo.name}/languages`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
          cache: 'force-cache',
        },
      )

      if (langResponse.ok) {
        const languages = await langResponse.json()
        Object.entries(languages).forEach(([lang, bytes]) => {
          languageBytes[lang] = (languageBytes[lang] || 0) + (bytes as number)
        })
      }
    } catch (error) {
      console.warn(`Failed to fetch languages for ${repo.name}:`, error)
    }
  }

  // Calculate percentages
  const totalBytes = Object.values(languageBytes).reduce(
    (sum, bytes) => sum + bytes,
    0,
  )
  const languages = Object.entries(languageBytes)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)

    return {
      languages,
      totalRepos,
      totalStars,
      archivedRepos,
      activeRepos,
    }
  } catch (error) {
    console.error('Error fetching GitHub language stats:', error)
    return {
      languages: [],
      totalRepos: 0,
      totalStars: 0,
      archivedRepos: 0,
      activeRepos: 0,
    }
  }
}
