import { MobileOptimizedChart } from '@/components/mobile/MobileOptimizedChart'
import { Breadcrumb } from '@/components/navigation/CompactNavigation'
import { SkeletonCard } from '@/components/SkeletonCard'
import { CompactCard, StatsCard } from '@/components/ui/CompactCard'
import { DashboardGrid, GridItem } from '@/components/ui/DashboardGrid'
import { QuickFilters } from '@/components/ui/DateRangeSelector'
import {
  CollapsibleSection,
  ProgressiveDisclosure,
} from '@/components/ui/ProgressiveDisclosure'
import {
  Activity,
  Clock,
  Eye,
  Globe,
  MousePointer,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Suspense } from 'react'
import { Cloudflare } from './cloudflare'
import { PostHog } from './posthog'

export const metadata = {
  title: 'Website Analytics',
  description:
    'Website traffic and performance analytics from Cloudflare and PostHog.',
}

// Static generation only
export const dynamic = 'force-static'

// Mock data for demonstration
const mockWebsiteStats = {
  visitors: { value: 15743, change: 18.5, period: 'last 30 days' },
  pageViews: { value: 42186, change: 12.3, period: 'last 30 days' },
  bounceRate: { value: '28.4%', change: -5.1, period: 'vs last month' },
  avgSession: { value: '4m 12s', change: 15.2, period: 'session duration' },
  loadTime: { value: '1.2s', change: -8.3, period: 'avg load time' },
  conversionRate: { value: '3.7%', change: 22.1, period: 'conversion rate' },
  dailyTraffic: [
    { date: '2024-01-01', visitors: 420, pageViews: 1250, bounces: 180 },
    { date: '2024-01-02', visitors: 380, pageViews: 1180, bounces: 150 },
    { date: '2024-01-03', visitors: 520, pageViews: 1450, bounces: 200 },
    { date: '2024-01-04', visitors: 610, pageViews: 1680, bounces: 220 },
    { date: '2024-01-05', visitors: 480, pageViews: 1380, bounces: 190 },
    { date: '2024-01-06', visitors: 350, pageViews: 950, bounces: 140 },
    { date: '2024-01-07', visitors: 290, pageViews: 820, bounces: 120 },
  ],
}

export default function CompactBlogPage() {
  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="border-b pb-4">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Website Analytics' },
          ]}
        />
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Website Analytics
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Traffic insights from Cloudflare and user behavior from PostHog
            </p>
          </div>
          <QuickFilters
            currentRange="30d"
            onRangeChange={() => {}} // Static for now
            showLabels={false}
          />
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Traffic Overview
        </h2>
        <DashboardGrid cols={3} gap="sm">
          <GridItem span={1} spanMd={1} spanLg={1}>
            <StatsCard
              title="Monthly Visitors"
              value={mockWebsiteStats.visitors.value.toLocaleString()}
              change={{
                value: mockWebsiteStats.visitors.change,
                period: mockWebsiteStats.visitors.period,
              }}
              icon={<Users />}
              compact
            />
          </GridItem>
          <GridItem span={1} spanMd={1} spanLg={1}>
            <StatsCard
              title="Page Views"
              value={mockWebsiteStats.pageViews.value.toLocaleString()}
              change={{
                value: mockWebsiteStats.pageViews.change,
                period: mockWebsiteStats.pageViews.period,
              }}
              icon={<Eye />}
              compact
            />
          </GridItem>
          <GridItem span={1} spanMd={1} spanLg={1}>
            <StatsCard
              title="Bounce Rate"
              value={mockWebsiteStats.bounceRate.value}
              change={{
                value: mockWebsiteStats.bounceRate.change,
                period: mockWebsiteStats.bounceRate.period,
              }}
              icon={<MousePointer />}
              compact
            />
          </GridItem>
        </DashboardGrid>

        {/* Secondary Metrics - Mobile Responsive */}
        <div className="mt-4">
          <DashboardGrid cols={3} gap="sm">
            <GridItem span={1}>
              <CompactCard padding="sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Avg Session
                    </span>
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-lg font-bold">
                      {mockWebsiteStats.avgSession.value}
                    </span>
                    <span className="text-xs text-green-600">
                      +{mockWebsiteStats.avgSession.change}%
                    </span>
                  </div>
                </div>
              </CompactCard>
            </GridItem>
            <GridItem span={1}>
              <CompactCard padding="sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Load Time
                    </span>
                    <Zap className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-lg font-bold">
                      {mockWebsiteStats.loadTime.value}
                    </span>
                    <span className="text-xs text-green-600">
                      {mockWebsiteStats.loadTime.change}%
                    </span>
                  </div>
                </div>
              </CompactCard>
            </GridItem>
            <GridItem span={1}>
              <CompactCard padding="sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Conversion
                    </span>
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-lg font-bold">
                      {mockWebsiteStats.conversionRate.value}
                    </span>
                    <span className="text-xs text-green-600">
                      +{mockWebsiteStats.conversionRate.change}%
                    </span>
                  </div>
                </div>
              </CompactCard>
            </GridItem>
          </DashboardGrid>
        </div>
      </div>

      {/* Traffic Trends - Mobile Optimized */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Traffic Trends
        </h2>
        <CompactCard title="Daily Website Traffic" padding="sm">
          <MobileOptimizedChart
            data={mockWebsiteStats.dailyTraffic}
            index="date"
            categories={['visitors', 'pageViews', 'bounces']}
            type="area"
            height={200}
            showControls
          />
        </CompactCard>
      </div>

      {/* Progressive Disclosure for Detailed Analytics */}
      <div className="space-y-4">
        <ProgressiveDisclosure
          title="Cloudflare Analytics"
          icon={<Globe className="h-4 w-4" />}
          description="CDN performance, security metrics, and global traffic insights"
          preview="Real-time traffic data, bandwidth usage, and threat protection statistics"
          badge="Live"
        >
          <Suspense fallback={<SkeletonCard />}>
            <Cloudflare />
          </Suspense>
        </ProgressiveDisclosure>

        <ProgressiveDisclosure
          title="User Behavior Analytics"
          icon={<Activity className="h-4 w-4" />}
          description="PostHog insights on user interactions and content performance"
          preview="Page views, session recordings, and conversion funnel analysis"
          badge="Beta"
        >
          <Suspense fallback={<SkeletonCard />}>
            <PostHog />
          </Suspense>
        </ProgressiveDisclosure>

        <CollapsibleSection title="Advanced Metrics" level={2}>
          <DashboardGrid cols={2} gap="md">
            <GridItem>
              <CompactCard title="Geographic Distribution" padding="sm">
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  Geographic traffic heatmap placeholder
                </div>
              </CompactCard>
            </GridItem>
            <GridItem>
              <CompactCard title="Device Breakdown" padding="sm">
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  Device type distribution placeholder
                </div>
              </CompactCard>
            </GridItem>
          </DashboardGrid>
        </CollapsibleSection>

        <CollapsibleSection title="Performance Insights" level={2}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CompactCard title="Core Web Vitals" padding="sm">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Largest Contentful Paint</span>
                  <span className="font-mono text-green-600">1.2s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>First Input Delay</span>
                  <span className="font-mono text-green-600">45ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cumulative Layout Shift</span>
                  <span className="font-mono text-green-600">0.05</span>
                </div>
              </div>
            </CompactCard>
            <CompactCard title="Cache Performance" padding="sm">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Cache Hit Rate</span>
                  <span className="font-mono text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Edge Response Time</span>
                  <span className="font-mono text-green-600">28ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bandwidth Saved</span>
                  <span className="font-mono text-green-600">2.8 GB</span>
                </div>
              </div>
            </CompactCard>
          </div>
        </CollapsibleSection>
      </div>

      {/* Quick Actions Footer */}
      <div className="border-t pt-4">
        <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground">
            Data from Cloudflare Analytics & PostHog • Updated every 15 minutes
          </div>
          <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-700">
              Export Report
            </button>
            <span className="text-muted-foreground">•</span>
            <button className="text-blue-600 hover:text-blue-700">
              Configure Alerts
            </button>
            <span className="text-muted-foreground">•</span>
            <button className="text-blue-600 hover:text-blue-700">
              Real-time View
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
