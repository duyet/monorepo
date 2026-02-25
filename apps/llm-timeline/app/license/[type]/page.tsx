import { TimelinePage } from '@/components/timeline-page'

const LICENSES = ['open', 'closed', 'partial'] as const
type LicenseType = typeof LICENSES[number]

export async function generateStaticParams() {
  return LICENSES.map((type) => ({ type }))
}

export default async function LicensePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  return <TimelinePage view="models" license={type as LicenseType} />
}
