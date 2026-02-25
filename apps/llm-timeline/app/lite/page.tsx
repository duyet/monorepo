import { PageLayout } from '@/components/page-layout'
import { TimelinePage } from '@/components/timeline-page'

export const metadata = {
  title: 'LLM Timeline (Lite Mode) | LLM Timeline',
  description: 'A streamlined, minimalist view of Large Language Model releases.',
  alternates: {
    canonical: 'https://llm-timeline.duyet.net/lite',
  },
}

export default function LitePage() {
  return (
    <PageLayout description="A streamlined, minimalist view of Large Language Model releases">
      <TimelinePage view="models" license="all" liteMode={true} />
    </PageLayout>
  )
}
