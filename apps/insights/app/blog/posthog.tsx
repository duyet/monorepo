import { BarList } from '@/components/charts'
import { MetricCard } from '@/components/ui/metric-card'
import { TextDataSource } from '../../components/text-data-source'
import { TrendingUp, Users, FileText } from 'lucide-react'

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

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Visitors"
          value={totalVisitors.toLocaleString()}
          description={`Last ${last} days`}
          icon={<Users className="h-6 w-6" />}
          change={{ value: 18, label: "vs previous period" }}
        />
        <MetricCard
          title="Page Views"
          value={totalViews.toLocaleString()}
          description={`Last ${last} days`}
          icon={<FileText className="h-6 w-6" />}
          change={{ value: 25, label: "vs previous period" }}
        />
        <MetricCard
          title="Avg per Page"
          value={avgVisitorsPerPage.toLocaleString()}
          description="Visitors per page"
          icon={<TrendingUp className="h-6 w-6" />}
          change={{ value: 10, label: "vs previous period" }}
        />
      </div>

      {/* Top Content List */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Most Popular Content</h3>
          <span className="text-sm text-muted-foreground">Visitors</span>
        </div>
        <BarList
          data={paths.map((path) => ({
            name: path.path.replace(/^\//, '').replace(/\/$/, '') || 'Home',
            value: path.visitors,
            href: process.env.NEXT_PUBLIC_DUYET_BLOG_URL + path.path,
          }))}
        />
      </div>

      <TextDataSource>PostHog Analytics • Last {last} days</TextDataSource>
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

  return data.results.map((result) => ({
    path: result[0] as string,
    visitors: result[1] as number,
    views: result[2] as number,
  }))
}
