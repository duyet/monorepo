import { Card, Metric, Text, AreaChart } from '@tremor/react'

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
      <div className='flex flex-row gap-5'>
        <div>
          <Text>Total Requests (30 days)</Text>
          <Metric>{dataFormatter(totalRequests)}</Metric>
        </div>
        <div>
          <Text>Total Pageviews (30 days)</Text>
          <Metric>{dataFormatter(totalPageviews)}</Metric>
        </div>
      </div>
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
