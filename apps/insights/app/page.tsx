import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard'
import { SkeletonCard } from '@/components/SkeletonCard'
import { Suspense } from 'react'

export const metadata = {
  title: '@duyet Insights Dashboard',
  description:
    'Analytics and insights for duyet.net - Web traffic, coding activity, and performance metrics.',
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <OverviewDashboard />
    </Suspense>
  )
}
