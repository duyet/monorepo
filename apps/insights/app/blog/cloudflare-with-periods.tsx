import type { CloudflareAnalyticsByDate } from '@duyet/interfaces'
import { request } from 'graphql-request'
import { TIME_PERIODS, type PeriodData } from '@/types/periods'
import { CloudflareClient } from './cloudflare-client'

export interface CloudflareDataByPeriod {
  data: CloudflareAnalyticsByDate
  totalRequests: number
  totalPageviews: number
  generatedAt: string
}

export async function CloudflareWithPeriods() {
  const allPeriodData = await getDataForAllPeriods()
  
  return <CloudflareClient data={allPeriodData} />
}

const getDataForAllPeriods = async (): Promise<PeriodData<CloudflareDataByPeriod>> => {
  const results: Partial<PeriodData<CloudflareDataByPeriod>> = {}
  const generatedAt = new Date().toISOString()

  // Fetch data for each time period
  for (const period of TIME_PERIODS) {
    try {
      const periodData = await getDataForPeriod(period.days)
      results[period.value] = {
        ...periodData,
        generatedAt,
      }
    } catch (error) {
      console.error(`Error fetching Cloudflare data for ${period.value}:`, error)
      // Fallback to empty data structure
      results[period.value] = {
        data: {
          viewer: {
            zones: [{
              httpRequests1dGroups: []
            }]
          }
        },
        totalRequests: 0,
        totalPageviews: 0,
        generatedAt,
      }
    }
  }

  return {
    ...results,
    generatedAt,
  } as PeriodData<CloudflareDataByPeriod>
}

const getDataForPeriod = async (days: number) => {
  // Cloudflare free tier only allows max 365 days of data
  const cappedDays = Math.min(days, 365)

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
    zoneTag: process.env.CLOUDFLARE_ZONE_ID,
    date_start: new Date(new Date().setDate(new Date().getDate() - cappedDays))
      .toISOString()
      .split('T')[0],
    date_end: new Date().toISOString().split('T')[0],
  }

  const headers = {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
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

  return {
    data,
    totalRequests,
    totalPageviews,
  }
}