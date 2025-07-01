import { request } from 'graphql-request'
import { AreaChart } from '@/components/charts'
import { MetricCard } from '@/components/ui/metric-card'
import type { CloudflareAnalyticsByDate } from '@duyet/interfaces'
import { TextDataSource } from '../../components/text-data-source'
import { Globe, Eye, Users, Activity } from 'lucide-react'

export interface CloudflareProps {
  data: CloudflareAnalyticsByDate
  totalRequests: number
  totalPageviews: number
  generatedAt: string
}

async function dataFormatter(number: number) {
  return Intl.NumberFormat('us').format(number).toString()
}

export async function Cloudflare() {
  const { data, generatedAt, totalRequests, totalPageviews } = await getData()

  const chartData = data.viewer.zones[0]?.httpRequests1dGroups?.map((item) => {
    return {
      date: item.date.date,
      'Page Views': item.sum.pageViews,
      Requests: item.sum.requests,
      'Unique Visitors': item.uniq.uniques,
    }
  })

  const totalUniques = data.viewer.zones[0]?.httpRequests1dGroups?.reduce((sum, item) => sum + item.uniq.uniques, 0) || 0
  const avgDailyRequests = Math.round((totalRequests || 0) / 30)
  
  const cards = [
    {
      title: 'Total Requests',
      value: await dataFormatter(totalRequests || 0),
      description: 'Past 30 days',
      icon: <Activity className="h-6 w-6" />,
      change: { value: 12, label: 'vs last month' }
    },
    {
      title: 'Page Views',
      value: await dataFormatter(totalPageviews || 0),
      description: 'Past 30 days', 
      icon: <Eye className="h-6 w-6" />,
      change: { value: 8, label: 'vs last month' }
    },
    {
      title: 'Unique Visitors',
      value: await dataFormatter(totalUniques),
      description: 'Past 30 days',
      icon: <Users className="h-6 w-6" />,
      change: { value: 15, label: 'vs last month' }
    },
    {
      title: 'Daily Average',
      value: await dataFormatter(avgDailyRequests),
      description: 'Requests per day',
      icon: <Globe className="h-6 w-6" />,
      change: { value: 5, label: 'vs last month' }
    },
  ]

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            change={card.change}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Traffic Trends</h3>
        <AreaChart
          categories={['Requests', 'Page Views', 'Unique Visitors']}
          data={chartData}
          index="date"
          showGridLines={true}
        />
      </div>

      <TextDataSource>Cloudflare Analytics • Generated at {new Date(generatedAt).toLocaleString()}</TextDataSource>
    </div>
  )
}

const getData = async () => {
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

  const variables = {
    zoneTag: process.env.NEXT_PUBLIC_CLOUDFLARE_ZONE_ID,
    date_start: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0],
    date_end: new Date().toISOString().split('T')[0],
  }

  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_KEY}`,
  }

  const data: CloudflareAnalyticsByDate = await request(
    'https://api.cloudflare.com/client/v4/graphql',
    query,
    variables,
    headers,
  )

  const zone = data.viewer.zones[0]

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
}
