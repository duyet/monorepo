import Image from 'next/image'
import type { GetStaticProps } from 'next'
import { request } from 'graphql-request'

import Container from '../components/Container'
import { CloudflareAnalyticsByDate } from '../interfaces'
import CloudflareAnalytics, {
  CloudflareAnalyticsProps,
} from '../components/CloudflareAnalytics'

type Props = CloudflareAnalyticsProps

const urls = [
  'https://wakatime.com/share/@8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9/bec141b5-a112-445b-8c79-c2a5f37e3380.svg',
  'https://wakatime.com/share/@8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9/fcfd3d44-340f-4a50-ba31-1c97b66a5a62.svg',
  'https://github-readme-stats.vercel.app/api?username=duyet&show_icons=true&theme=vue&hide_border=true&custom_title=@duyet',
]

export default function Stats(props: Props) {
  return (
    <Container>
      <CloudflareAnalytics {...props} />

      <div className='space-y-6 mt-10'>
        <div className='flex flex-col gap-5'>
          {urls.map((url) => (
            <Image key={url} src={url} width={800} height={500} alt='' />
          ))}
        </div>
      </div>
    </Container>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
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
    Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_CLOUDFLARE_API_KEY,
  }

  const data: CloudflareAnalyticsByDate = await request(
    'https://api.cloudflare.com/client/v4/graphql',
    query,
    variables,
    headers
  )

  const zone = data.viewer.zones[0]

  const totalRequests = zone.httpRequests1dGroups.reduce(
    (total, i) => total + i.sum.requests,
    0
  )

  const totalPageviews = zone.httpRequests1dGroups.reduce(
    (total, i) => total + i.sum.pageViews,
    0
  )

  const generatedAt = new Date().toISOString()

  return {
    props: {
      data,
      generatedAt,
      totalRequests,
      totalPageviews,
    },
  }
}
