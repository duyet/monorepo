import { Flex, Card, Metric, Text, AreaChart } from '@tremor/react'

import { CloudflareAnalyticsByDate } from '../interfaces'

export type CloudflareAnalyticsProps = {
  data: CloudflareAnalyticsByDate
  totalRequests: number
  totalPageviews: number
  generatedAt: string
}

const dataFormatter = (number: number) => {
  return Intl.NumberFormat('us').format(number).toString()
}

export default function CloudflareAnalytics({
  data,
  generatedAt,
  totalRequests,
  totalPageviews,
}: CloudflareAnalyticsProps) {
  const chartData = data.viewer.zones[0].httpRequests1dGroups.map((item) => {
    return {
      date: item.date.date,
      'Page Views': item.sum.pageViews,
      Requests: item.sum.requests,
      'Unique Visitors': item.uniq.uniques,
    }
  })

  return (
    <Card className='mx-auto'>
      <Flex className='mb-5'>
        <div>
          <Text>Total Requests</Text>
          <Flex
            className='space-x-3'
            justifyContent='start'
            alignItems='baseline'
          >
            <Metric>{dataFormatter(totalRequests)}</Metric>
            <Text className='truncate'>in 30 days</Text>
          </Flex>
        </div>
        <div>
          <Text>Total Pageviews</Text>
          <Flex
            className='space-x-3'
            justifyContent='start'
            alignItems='baseline'
          >
            <Metric>{dataFormatter(totalPageviews)}</Metric>
            <Text className='truncate'>in 30 days</Text>
          </Flex>
        </div>
      </Flex>
      <AreaChart
        data={chartData}
        index='date'
        categories={['Requests', 'Page Views', 'Unique Visitors']}
        showYAxis={false}
        valueFormatter={dataFormatter}
      />
      <div className='text-sm italic text-gray-600 text-right mt-5'>
        Source: Cloudflare | Generated at {generatedAt}
      </div>
    </Card>
  )
}
