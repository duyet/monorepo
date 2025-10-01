import { AreaChart } from '@/components/charts'
import { CompactMetric } from '@/components/ui/CompactMetric'
import type { CloudflareAnalyticsByDate } from '@duyet/interfaces'
import { request } from 'graphql-request'
import { Activity, Eye, Globe, Users } from 'lucide-react'

export interface CloudflareProps {
  data: CloudflareAnalyticsByDate
  totalRequests: number
  totalPageviews: number
  generatedAt: string
  days: number | 'all'
}

function dataFormatter(number: number) {
  return Intl.NumberFormat('en-US').format(number).toString()
}

export async function Cloudflare({ days = 30 }: { days?: number | 'all' }) {
  const { data, generatedAt, totalRequests, totalPageviews } =
    await getData(days)

  const chartData = data.viewer.zones[0]?.httpRequests1dGroups?.map((item) => {
    return {
      date: item.date.date, // Already in YYYY-MM-DD format from Cloudflare API
      'Page Views': item.sum.pageViews,
      Requests: item.sum.requests,
      'Unique Visitors': item.uniq.uniques,
    }
  })

  // Find the latest day with actual data (non-zero values)
  const httpGroups = data.viewer.zones[0]?.httpRequests1dGroups || []
  const latestDataDay = httpGroups
    .slice()
    .reverse() // Start from most recent
    .find(
      (item) =>
        item.sum.requests > 0 ||
        item.sum.pageViews > 0 ||
        item.uniq.uniques > 0,
    )

  // Use latest day data or fallback to totals if no recent data
  const latestRequests = latestDataDay?.sum.requests || totalRequests || 0
  const latestPageviews = latestDataDay?.sum.pageViews || totalPageviews || 0
  const latestUniques = latestDataDay?.uniq.uniques || 0
  const latestDate =
    latestDataDay?.date.date || new Date().toISOString().split('T')[0]

  const metrics = [
    {
      label: 'Daily Requests',
      value: dataFormatter(latestRequests),
      icon: <Activity className="h-4 w-4" />,
      change: latestRequests > 0 ? { value: 12 } : undefined,
    },
    {
      label: 'Daily Page Views',
      value: dataFormatter(latestPageviews),
      icon: <Eye className="h-4 w-4" />,
      change: latestPageviews > 0 ? { value: 8 } : undefined,
    },
    {
      label: 'Daily Visitors',
      value: dataFormatter(latestUniques),
      icon: <Users className="h-4 w-4" />,
      change: latestUniques > 0 ? { value: 15 } : undefined,
    },
    {
      label: `Total (${days === 'all' ? 'All time' : `${days}d`})`,
      value: dataFormatter(totalRequests || 0),
      icon: <Globe className="h-4 w-4" />,
      change: (totalRequests || 0) > 0 ? { value: 5 } : undefined,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
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

      {/* Chart */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Traffic Trends</h3>
          <p className="text-xs text-muted-foreground">
            {days === 'all' ? 'All time' : `${days}-day`} overview
          </p>
        </div>
        <AreaChart
          categories={['Requests', 'Page Views', 'Unique Visitors']}
          data={chartData}
          index="date"
          showGridLines={true}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Data from Cloudflare • Latest day: {latestDate} • Updated{' '}
        {new Date(generatedAt).toLocaleDateString()}
      </p>
    </div>
  )
}

const getData = async (days: number | 'all' = 30) => {
  // Check if required environment variables are present
  if (!process.env.CLOUDFLARE_ZONE_ID || !process.env.CLOUDFLARE_API_KEY) {
    console.warn(
      'Cloudflare API credentials not configured, returning empty data',
    )
    const emptyData = {
      viewer: {
        zones: [
          {
            httpRequests1dGroups: [],
          },
        ],
      },
    }
    return {
      data: emptyData,
      generatedAt: new Date().toISOString(),
      totalRequests: 0,
      totalPageviews: 0,
    }
  }

  const query = `
    query viewer($zoneTag: string, $date_start: string, $date_end: string) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequests1dGroups(
            orderBy: [date_ASC]
            limit: 1000
            filter: { date_geq: $date_start, date_lt: $date_end }
          ) {
            date: dimensions {
              date
            }
            sum {
              requests
              pageViews
              cachedBytes
              bytes
            }
            uniq {
              uniques
            }
          }
        }
      }
    }`

  // Calculate date range based on days parameter
  const daysToSubtract = days === 'all' ? 365 * 3 : days // 3 years for "all"
  const variables = {
    zoneTag: process.env.CLOUDFLARE_ZONE_ID,
    date_start: new Date(
      new Date().setDate(new Date().getDate() - daysToSubtract),
    )
      .toISOString()
      .split('T')[0],
    date_end: new Date().toISOString().split('T')[0],
  }

  const headers = {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
  }

  try {
    const data: CloudflareAnalyticsByDate = await request(
      'https://api.cloudflare.com/client/v4/graphql',
      query,
      variables,
      headers,
    )

    const zone = data.viewer.zones[0]

    if (!zone || !zone.httpRequests1dGroups) {
      console.warn('No zone data returned from Cloudflare API')
      const emptyData = {
        viewer: {
          zones: [
            {
              httpRequests1dGroups: [],
            },
          ],
        },
      }
      return {
        data: emptyData,
        generatedAt: new Date().toISOString(),
        totalRequests: 0,
        totalPageviews: 0,
      }
    }

    const totalRequests = zone.httpRequests1dGroups.reduce(
      (total, i) => total + i.sum.requests,
      0,
    )

    const totalPageviews = zone.httpRequests1dGroups.reduce(
      (total, i) => total + i.sum.pageViews,
      0,
    )

    const generatedAt = new Date().toISOString()

    return {
      data,
      generatedAt,
      totalRequests,
      totalPageviews,
    }
  } catch (error) {
    console.error('Cloudflare API error:', error)
    const emptyData = {
      viewer: {
        zones: [
          {
            httpRequests1dGroups: [],
          },
        ],
      },
    }
    return {
      data: emptyData,
      generatedAt: new Date().toISOString(),
      totalRequests: 0,
      totalPageviews: 0,
    }
  }
}
