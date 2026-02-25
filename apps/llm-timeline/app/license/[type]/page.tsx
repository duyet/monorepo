import { notFound } from 'next/navigation'
import { TimelinePage } from '@/components/timeline-page'

const LICENSES = ['open', 'closed', 'partial'] as const
type LicenseType = typeof LICENSES[number]

const LICENSE_LABELS: Record<LicenseType, string> = {
  open: 'Open License',
  closed: 'Closed License',
  partial: 'Partial License',
}

const LICENSE_DESCRIPTIONS: Record<LicenseType, string> = {
  open: 'Models with openly available weights and code',
  closed: 'Proprietary models with API-only access',
  partial: 'Models with some restricted access or partial weights',
}

export async function generateStaticParams() {
  return LICENSES.map((type) => ({ type }))
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params

  if (!LICENSES.includes(type as LicenseType)) {
    return {}
  }

  const label = LICENSE_LABELS[type as LicenseType]
  return {
    title: `${label} Models | LLM Timeline`,
    description: LICENSE_DESCRIPTIONS[type as LicenseType],
    alternates: {
      canonical: `https://llm-timeline.duyet.net/license/${type}`,
    },
  }
}

export default async function LicensePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params

  if (!LICENSES.includes(type as LicenseType)) {
    notFound()
  }

  return <TimelinePage view="models" license={type as LicenseType} />
}
