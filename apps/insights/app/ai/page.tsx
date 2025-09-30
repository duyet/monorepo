import { Suspense } from 'react'
import { SkeletonCard } from '../../components/SkeletonCard'
import { CCUsageActivity } from './activity'
import { CCUsageCosts } from './costs'
import { CCUsageMetrics } from './metrics'
import { CCUsageModels } from './models'
import { StaticDateFilter } from './static-date-filter'
import { CCUsageErrorBoundary } from './error-boundary'
import type { DateRangeDays } from './types'

export const metadata = {
  title: 'Claude Code Usage Analytics @duyet',
  description:
    'AI usage analytics, token consumption, and model insights from Claude Code',
}

// Static generation only - using default 30 days
export const dynamic = 'force-static'

// Configuration for static generation
const STATIC_DAYS: DateRangeDays = 30
const SECTION_CONFIGS = [
  {
    id: 'metrics',
    title: 'Usage Overview',
    description: 'Token consumption and activity summary for the last 30 days',
    component: CCUsageMetrics,
  },
  {
    id: 'activity',
    title: 'Daily Activity',
    description: 'Token usage patterns over the last 30 days',
    component: CCUsageActivity,
  },
  {
    id: 'models',
    title: 'AI Model Usage',
    description: 'Model distribution and usage patterns',
    component: CCUsageModels,
  },
  {
    id: 'costs',
    title: 'Daily Costs',
    description: 'Cost breakdown and spending patterns over time',
    component: CCUsageCosts,
  },
] as const

export default function CCUsage() {
  return (
    <div className="space-y-8">
      {/* Header with Date Filter */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            AI Usage Analytics
          </h1>
          <p className="mt-1 text-muted-foreground">
            Claude Code usage patterns, token consumption, and model insights
          </p>
        </div>
        <StaticDateFilter currentPeriod="30 days" />
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {SECTION_CONFIGS.map((section) => {
          const Component = section.component
          
          return (
            <section key={section.id} className="space-y-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <CCUsageErrorBoundary>
                <Suspense fallback={<SkeletonCard />}>
                  <Component days={STATIC_DAYS} />
                </Suspense>
              </CCUsageErrorBoundary>
            </section>
          )
        })}

        <p className="text-xs text-muted-foreground">
          Claude Code Usage Analytics
        </p>
      </div>
    </div>
  )
}
