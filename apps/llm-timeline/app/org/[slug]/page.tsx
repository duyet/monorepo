import { TimelinePage } from '@/components/timeline-page'
import { organizations } from '@/lib/data'
import { slugify } from '@/lib/utils'

export async function generateStaticParams() {
  return organizations.map(o => ({ slug: slugify(o) }))
}

export default async function OrgPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <TimelinePage view="models" license="all" orgSlug={slug} />
}
