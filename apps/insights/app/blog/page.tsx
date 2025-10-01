import { Suspense } from 'react'
import { SkeletonCard } from '../../components/SkeletonCard'
import { Cloudflare } from './cloudflare'
import { PostHog } from './posthog'
import { DEFAULT_PERIOD, getPeriodDays } from '@/lib/periods'
import type { PeriodDays } from '@/lib/periods'

export const metadata = {
  title: 'Blog Insights',
  description: 'Blog Insights data collected from Cloudflare and PostHog.',
}

// Static generation only
export const dynamic = 'force-static'

const STATIC_DAYS: PeriodDays = getPeriodDays(DEFAULT_PERIOD) as PeriodDays

export default function Page() {
  return (
    <>
      <Suspense fallback={<SkeletonCard />}>
        <Cloudflare days={STATIC_DAYS} />
      </Suspense>
      <Suspense fallback={<SkeletonCard />}>
        <PostHog days={STATIC_DAYS} />
      </Suspense>
    </>
  )
}
