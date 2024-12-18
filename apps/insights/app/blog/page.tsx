import { Suspense } from 'react'
import { SkeletonCard } from '../../components/skeleton-card'
import { Cloudflare } from './cloudflare'
import { PostHog } from './posthog'

export const metadata = {
  title: 'Blog Insights',
  description: 'Blog Insights data collected from Cloudflare and PostHog.',
}

// Revalidate every 24 hours
export const revalidate = 86400

export default function Page() {
  return (
    <>
      <Suspense fallback={<SkeletonCard />}>
        <Cloudflare />
      </Suspense>
      <Suspense fallback={<SkeletonCard />}>
        <PostHog />
      </Suspense>
    </>
  )
}
