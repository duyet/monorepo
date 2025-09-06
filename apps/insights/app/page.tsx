import { CloudflareWithPeriods } from './blog/cloudflare-with-periods'
import { PostHogWithPeriods } from './blog/posthog-with-periods'

export const metadata = {
  title: '@duyet Insights Dashboard',
  description:
    'Analytics and insights for duyet.net - Web traffic, coding activity, and performance metrics.',
}

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Real-time insights and performance metrics
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Website Analytics */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Website Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Traffic and performance metrics from Cloudflare
            </p>
          </div>
          <CloudflareWithPeriods />
        </div>

        {/* Content Analytics */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Content Performance</h2>
            <p className="text-sm text-muted-foreground">
              Most popular pages and visitor insights from PostHog
            </p>
          </div>
          <PostHogWithPeriods />
        </div>
      </div>
    </div>
  )
}
