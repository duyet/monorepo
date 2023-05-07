'use client'

import { Flex, Metric, Text, AreaChart } from '@tremor/react'

import { CloudflareAnalyticsByDate } from '../../../interfaces'

export type CloudflareProps = {
  data: CloudflareAnalyticsByDate
  totalRequests: number
  totalPageviews: number
  generatedAt: string
}

const dataFormatter = (number: number) => {
  return Intl.NumberFormat('us').format(number).toString()
}

export default function Cloudflare({
  data,
  generatedAt,
  totalRequests,
  totalPageviews,
}: CloudflareProps) {
  const chartData = data.viewer.zones[0].httpRequests1dGroups.map((item) => {
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
      value: dataFormatter(totalRequests),
      valueDesc: 'in 30 days',
    },
    {
      title: 'Total Pageviews',
      value: dataFormatter(totalPageviews),
      valueDesc: 'in 30 days',
    },
  ]

  return (
    <div className='mx-auto'>
      <Flex className='mb-5'>
        {cards.map((card) => (
          <div key={card.title}>
            <Text className='dark:text-white'>{card.title}</Text>
            <Flex
              className='space-x-3'
              justifyContent='start'
              alignItems='baseline'
            >
              <Metric className='dark:text-white'>{card.value}</Metric>
              <Text className='truncate dark:text-white'>{card.valueDesc}</Text>
            </Flex>
          </div>
        ))}
      </Flex>
      <AreaChart
        index='date'
        data={chartData}
        showYAxis={false}
        showGridLines={false}
        valueFormatter={dataFormatter}
        categories={['Requests', 'Page Views', 'Unique Visitors']}
      />
      <div className='text-sm italic text-gray-400 text-right mt-5'>
        Source: Cloudflare | Generated at {generatedAt}
      </div>
    </div>
  )
}
