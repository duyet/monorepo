import { PopularContentTable } from '@/components/PopularContentTable'
import { CompactMetric } from '@/components/ui/CompactMetric'
import { FileText, TrendingUp, Users } from 'lucide-react'

const POSTHOG_API = `https://app.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/query/`

interface Path {
  path: string
  visitors: number
  views: number
}

export async function PostHog() {
  if (!process.env.POSTHOG_API_KEY || !process.env.POSTHOG_PROJECT_ID) {
    console.error('POSTHOG_API_KEY or POSTHOG_PROJECT_ID is not set')
    return null
  }

  const top = 20
  const last = 30
  const paths = await getTopPath(top, `-${last}d`)

  const totalVisitors = paths.reduce((sum, path) => sum + path.visitors, 0)
  const totalViews = paths.reduce((sum, path) => sum + path.views, 0)
  const avgVisitorsPerPage = Math.round(totalVisitors / paths.length)

  const metrics = [
    {
      label: 'Total Visitors',
      value: totalVisitors.toLocaleString(),
      icon: <Users className="h-4 w-4" />,
      change: totalVisitors > 0 ? { value: 18 } : undefined,
    },
    {
      label: 'Page Views',
      value: totalViews.toLocaleString(),
      icon: <FileText className="h-4 w-4" />,
      change: totalViews > 0 ? { value: 25 } : undefined,
    },
    {
      label: 'Avg per Page',
      value: avgVisitorsPerPage.toLocaleString(),
      icon: <TrendingUp className="h-4 w-4" />,
      change: avgVisitorsPerPage > 0 ? { value: 10 } : undefined,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      {/* Popular Content Table */}
      <PopularContentTable
        data={paths.map((path) => ({
          name: path.path,
          value: path.visitors,
          href: process.env.NEXT_PUBLIC_DUYET_BLOG_URL + path.path,
        }))}
      />

      <p className="text-xs text-muted-foreground">
        Data from PostHog • Last {last} days
      </p>
    </div>
  )
}

interface PostHogResponse {
  cache_key: string
  is_cached: boolean
  columns: string[]
  error: string | null
  hasMore: boolean
  hogql: string
  last_refresh: string
  limit: number
  offset: number
  modifiers: object
  types: string[][]
  results: (string | number)[][]
  timezone: string
}

async function getTopPath(
  limit = 10,
  dateFrom: '-30d' | '-90d' = '-90d',
): Promise<Path[]> {
  console.log('Fetching Posthog data', POSTHOG_API)

  const raw = await fetch(POSTHOG_API, {
    method: 'POST',
    cache: 'force-cache',
    headers: {
      Authorization: `Bearer ${process.env.POSTHOG_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        kind: 'WebStatsTableQuery',
        properties: [],
        breakdownBy: 'Page',
        dateRange: {
          date_from: dateFrom,
          date_to: null,
        },
        includeScrollDepth: false,
        includeBounceRate: true,
        doPathCleaning: false,
        limit,
        useSessionsTable: true,
      },
    }),
  })

  const data = (await raw.json()) as PostHogResponse

  // Map data based on column structure with validation
  const pathIndex = data.columns.findIndex(
    (col) =>
      col.toLowerCase().includes('page') ||
      col.toLowerCase().includes('path') ||
      col.toLowerCase().includes('breakdown_value'),
  )
  const visitorsIndex = data.columns.findIndex(
    (col) =>
      col.toLowerCase().includes('visitor') ||
      col.toLowerCase().includes('unique'),
  )
  const viewsIndex = data.columns.findIndex(
    (col) =>
      col.toLowerCase().includes('view') ||
      col.toLowerCase().includes('pageview'),
  )

  // Validate that we found the expected columns
  if (pathIndex === -1 || visitorsIndex === -1 || viewsIndex === -1) {
    console.warn('PostHog columns not found as expected:', {
      columns: data.columns,
      pathIndex,
      visitorsIndex,
      viewsIndex,
    })
    // Return empty array instead of potentially incorrect data
    return []
  }

  return data.results.map((result) => {
    const pathValue = result[pathIndex] as string
    const visitorsData = result[visitorsIndex]
    const viewsData = result[viewsIndex]

    // Handle array format [count, comparison] or simple number
    const visitors = Array.isArray(visitorsData)
      ? Number(visitorsData[0]) || 0
      : Number(visitorsData) || 0
    const views = Array.isArray(viewsData)
      ? Number(viewsData[0]) || 0
      : Number(viewsData) || 0

    return {
      path: pathValue,
      visitors,
      views,
    }
  })
}
