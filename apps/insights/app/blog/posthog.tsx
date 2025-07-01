import { BarList } from '@/components/charts'
import { TextDataSource } from '../../components/text-data-source'

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

  return (
    <div className="mt-10 space-y-6 rounded border p-5 dark:border-gray-800">
      <div className="basis-full">
        <div className="text-bold mb-4 flex flex-row justify-between">
          <span className="font-bold">Top {top}</span>
          <span className="font-bold">Visitors</span>
        </div>
        <BarList
          data={paths.map((path) => ({
            name: path.path,
            value: path.visitors,
            href: process.env.NEXT_PUBLIC_DUYET_BLOG_URL + path.path,
          }))}
        />
      </div>

      <TextDataSource>PostHog (last {last} days)</TextDataSource>
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
