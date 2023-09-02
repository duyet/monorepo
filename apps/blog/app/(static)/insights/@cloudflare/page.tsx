import { request } from 'graphql-request'
import { Text, Flex, Metric, AreaChart } from '@duyet/components'
import type { CloudflareAnalyticsByDate } from '@duyet/interfaces'
import TextDataSource from '../text-data-source'

export interface CloudflareProps {
  data: CloudflareAnalyticsByDate
  totalRequests: number
  totalPageviews: number
  generatedAt: string
}

// Revalidate every 24 hours
export const revalidate = 86400

async function dataFormatter(number: number) {
  return Intl.NumberFormat('us').format(number).toString()
}

export default async function Cloudflare() {
  const { data, generatedAt, totalRequests, totalPageviews } = await getData()

  const chartData = data.viewer.zones[0]?.httpRequests1dGroups?.map((item) => {
    return {
      date: item.date.date,
      'Page Views': item.sum.pageViews,
      Requests: item.sum.requests,
      'Unique Visitors': item.uniq.uniques,
    }
  })

  const cards = [
    {
      title: 'Total Requests',
      value: await dataFormatter(totalRequests || 0),
      valueDesc: 'in 30 days',
    },
    {
      title: 'Total Pageviews',
      value: await dataFormatter(totalPageviews || 0),
      valueDesc: 'in 30 days',
    },
  ]

  return (
    <div className="mx-auto">
      <Flex className="mb-5">
        {cards.map((card) => (
          <div key={card.title}>
            <Text className="dark:text-white">{card.title}</Text>
            <Flex
              alignItems="baseline"
              className="space-x-3"
              justifyContent="start"
            >
              <Metric className="dark:text-white">{card.value}</Metric>
              <Text className="truncate dark:text-white">{card.valueDesc}</Text>
            </Flex>
          </div>
        ))}
      </Flex>
      <AreaChart
        categories={['Requests', 'Page Views', 'Unique Visitors']}
        data={chartData}
        index="date"
        showGridLines={false}
        showYAxis={false}
      />

      <TextDataSource>Cloudflare | Generated at {generatedAt}</TextDataSource>
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
