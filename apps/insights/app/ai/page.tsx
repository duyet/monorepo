import { SectionLayout } from '@/components/layouts'
import { DEFAULT_PERIOD, getPeriodDays } from '@/lib/periods'
import { CCUsageActivity } from './activity'
import { CCUsageCosts } from './costs'
import { CCUsageDailyTable } from './daily-table'
import { CCUsageErrorBoundary } from './error-boundary'
import { CCUsageMetrics } from './metrics'
import { CCUsageModels } from './models'
import type { DateRangeDays } from './types'

export const metadata = {
  title: 'AI Usage Analytics',
  description:
    'AI usage analytics, token consumption, and model insights from Claude Code',
}

// Static generation
export const dynamic = 'force-static'

// Default is 30 days
const STATIC_DAYS: DateRangeDays = getPeriodDays(
  DEFAULT_PERIOD,
) as DateRangeDays

export default function CCUsage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          AI Usage Analytics
        </h1>
        <p className="mt-1 text-muted-foreground">
          Claude Code usage patterns, token consumption, and model insights
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Note: Costs are estimated based on Claude subscription pricing and may
          not reflect actual charges
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <CCUsageErrorBoundary>
          <SectionLayout
            title="Usage Overview"
            description="Token consumption and activity summary"
          >
            <CCUsageMetrics days={STATIC_DAYS} />
          </SectionLayout>
        </CCUsageErrorBoundary>

        <CCUsageErrorBoundary>
          <SectionLayout
            title="Daily Activity"
            description="Token usage patterns"
          >
            <CCUsageActivity days={STATIC_DAYS} />
          </SectionLayout>
        </CCUsageErrorBoundary>

        <CCUsageErrorBoundary>
          <SectionLayout
            title="AI Model Usage"
            description="Model distribution and usage patterns"
          >
            <CCUsageModels days={STATIC_DAYS} />
          </SectionLayout>
        </CCUsageErrorBoundary>

        <CCUsageErrorBoundary>
          <SectionLayout
            title="Daily Costs"
            description="Cost breakdown and spending patterns"
          >
            <CCUsageCosts days={STATIC_DAYS} />
          </SectionLayout>
        </CCUsageErrorBoundary>

        <CCUsageErrorBoundary>
          <SectionLayout
            title="Daily Usage Detail"
            description="Complete daily breakdown of tokens and costs"
          >
            <CCUsageDailyTable days={STATIC_DAYS} />
          </SectionLayout>
        </CCUsageErrorBoundary>

        <p className="text-xs text-muted-foreground">
          Claude Code Usage Analytics
        </p>
      </div>
    </div>
  )
}
