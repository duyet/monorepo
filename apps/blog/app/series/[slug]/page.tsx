import { getSeries } from '@duyet/libs/getSeries'
import { notFound } from 'next/navigation'
import { SeriesBox } from '../../../components/series'

export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function SeriesPage({ params }: PageProps) {
  const { slug } = await params
  const series = getSeries({ slug })

  if (!series) {
    return notFound()
  }

  return <SeriesBox className="mt-0 border-0 pb-10 pt-10" series={series} />
}
