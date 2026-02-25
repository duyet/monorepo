import { Suspense } from 'react'
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
    <Suspense fallback={<div>Loading...</div>}>
      <TimelinePage view="models" license="all" liteMode={true} />
    </Suspense>
  )
}
