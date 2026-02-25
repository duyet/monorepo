import { notFound } from 'next/navigation'
import { PageLayout } from '@/components/page-layout'
import { TimelinePage } from '@/components/timeline-page'
import { years } from '@/lib/data'

export async function generateStaticParams() {
  return years.map((year) => ({ year: year.toString() }))
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params
  const yearNum = parseInt(year, 10)

  if (isNaN(yearNum) || !years.includes(yearNum)) {
    return {}
  }

  return {
    title: `LLM Models Released in ${year} | LLM Timeline`,
    description: `A comprehensive timeline of Large Language Model releases from ${year}.`,
    alternates: {
      canonical: `https://llm-timeline.duyet.net/year/${year}`,
    },
  }
}

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params
  const yearNum = parseInt(year, 10)

  if (isNaN(yearNum) || !years.includes(yearNum)) {
    notFound()
  }

  return (
    <PageLayout title={`LLM Models Released in ${year}`} description={`Timeline of Large Language Model releases from ${year}`}>
      <TimelinePage view="models" license="all" year={yearNum} />
    </PageLayout>
  )
}
