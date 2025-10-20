import { TIME_PERIODS, type PeriodData } from '@/types/periods'
import { PostHogClient } from './posthog-client'
import { isPostHogConfigured, queryPostHog } from '@/lib/posthog'

interface Path {
  path: string
  visitors: number
  views: number
}

export interface PostHogDataByPeriod {
  paths: Path[]
  totalVisitors: number
  totalViews: number
  avgVisitorsPerPage: number
  generatedAt: string
}

export async function PostHogWithPeriods() {
  if (!isPostHogConfigured()) {
    return null
  }

  const allPeriodData = await getDataForAllPeriods()

  return <PostHogClient data={allPeriodData} />
}

const getDataForAllPeriods = async (): Promise<
  PeriodData<PostHogDataByPeriod>
> => {
  const results: Partial<PeriodData<PostHogDataByPeriod>> = {}
  const generatedAt = new Date().toISOString()
  const top = 20

  // Fetch data for each time period
  for (const period of TIME_PERIODS) {
    try {
      const dateFrom = `-${period.days}d`
      const paths = await getTopPath(top, dateFrom as '-30d' | '-90d')

      const totalVisitors = paths.reduce((sum, path) => sum + path.visitors, 0)
      const totalViews = paths.reduce((sum, path) => sum + path.views, 0)
      const avgVisitorsPerPage =
        paths.length > 0 ? Math.round(totalVisitors / paths.length) : 0

      results[period.value] = {
        paths,
        totalVisitors,
        totalViews,
        avgVisitorsPerPage,
        generatedAt,
      }
    } catch (error) {
      console.error(`Error fetching PostHog data for ${period.value}:`, error)
      // Fallback to empty data structure
      results[period.value] = {
        paths: [],
        totalVisitors: 0,
        totalViews: 0,
        avgVisitorsPerPage: 0,
        generatedAt,
      }
    }
  }

  return {
    ...results,
    generatedAt,
  } as PeriodData<PostHogDataByPeriod>
}

async function getTopPath(limit = 10, dateFrom: string): Promise<Path[]> {
  const data = await queryPostHog({
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
  })

  if (!data) {
    return []
  }

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
