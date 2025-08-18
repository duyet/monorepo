import { Suspense } from 'react'
import Image from 'next/image'
import { StaticCard } from '../../components/static-card'
import { SkeletonCard } from '../../components/skeleton-card'
import { WakaTimeActivity } from './activity'
import { WakaTimeLanguages } from './languages'
import { WakaTimeMetrics } from './metrics'

export const metadata = {
  title: 'WakaTime Coding Analytics @duyet',
  description: 'Programming activity, language statistics, and coding insights from WakaTime',
}


// Static generation only
export const dynamic = 'force-static'

export default function Wakatime() {

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Coding Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Programming activity and language statistics from WakaTime
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Coding Metrics */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Coding Overview</h2>
            <p className="text-sm text-muted-foreground">Programming activity summary for the last 30 days</p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <WakaTimeMetrics />
          </Suspense>
        </div>

        {/* Coding Activity */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Daily Activity</h2>
            <p className="text-sm text-muted-foreground">Coding hours over the last 30 days</p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <WakaTimeActivity />
          </Suspense>
        </div>

        {/* Programming Languages */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Programming Languages</h2>
            <p className="text-sm text-muted-foreground">Language usage and distribution</p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <WakaTimeLanguages />
          </Suspense>
        </div>

        {/* Activity Calendar */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Yearly Activity</h2>
            <p className="text-sm text-muted-foreground">Annual coding activity heatmap</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <StaticCard
              extra={
                <Image
                  alt="Wakatime Badge"
                  className="mt-3"
                  height={30}
                  src="https://wakatime.com/badge/user/8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9.svg"
                  unoptimized
                  width={200}
                />
              }
              source="WakaTime (Last Year)"
              title="Coding Activity Heatmap"
              url={{
                light: 'https://wakatime.com/share/@duyet/bf2b1851-7d8f-4c32-9033-f0ac18362d9e.svg',
                dark: 'https://wakatime.com/share/@duyet/b7b8389a-04ba-402f-9095-b1748a5be49c.svg',
              }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Data from WakaTime • Updated daily
        </p>
      </div>
    </div>
  )
}

