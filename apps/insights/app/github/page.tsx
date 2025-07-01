import { Suspense } from 'react'
import { SkeletonCard } from '../../components/skeleton-card'
import { GithubActivity } from './activity'
import { GithubCard } from './card'
import { Repos } from './repos'

const owner = 'duyet'

export const metadata = {
  title: 'GitHub Insights @duyet',
  description: 'GitHub repository analytics and development activity insights',
}

// Revalidate every 24 hours
export const revalidate = 86400

export default function Page() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">GitHub Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Repository insights and development activity
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Repository Analytics */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Repository Overview</h2>
            <p className="text-sm text-muted-foreground">Public repositories and statistics</p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <Repos owner={owner} />
          </Suspense>
        </div>

        {/* Development Activity */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Development Activity</h2>
            <p className="text-sm text-muted-foreground">Recent contributions and activity patterns</p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <GithubActivity owner={owner} />
          </Suspense>
        </div>

        {/* Profile Stats */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Profile Statistics</h2>
            <p className="text-sm text-muted-foreground">Overall GitHub profile metrics</p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <GithubCard owner={owner} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
