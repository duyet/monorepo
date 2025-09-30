'use client'

import { DashboardGrid, GridItem } from '@/components/ui/DashboardGrid'
import { CompactCard, StatsCard } from '@/components/ui/CompactCard'
import { CompactAreaChart, MiniSparkline, CompactPieChart } from '@/components/charts/CompactChart'
import {
  Users,
  GitCommit,
  Clock,
  Zap,
  BarChart3,
  Eye,
  MousePointer
} from 'lucide-react'

// Mock data for demonstration - replace with real data fetching
const mockOverviewData = {
  websiteStats: {
    visitors: { value: 12543, change: 15.2, period: 'last 30 days' },
    pageViews: { value: 34567, change: 8.7, period: 'last 30 days' },
    bounceRate: { value: '32.4%', change: -5.1, period: 'last 30 days' },
    avgSession: { value: '3m 24s', change: 12.3, period: 'last 30 days' },
  },
  codingStats: {
    totalHours: { value: 156, change: 23.1, period: 'last 30 days' },
    commits: { value: 247, change: 18.5, period: 'last 30 days' },
    languages: { value: 8, change: 0, period: 'active languages' },
    productivity: { value: '87%', change: 5.2, period: 'vs last month' },
  },
  aiUsage: {
    tokens: { value: '1.2M', change: 34.7, period: 'last 30 days' },
    sessions: { value: 89, change: 12.4, period: 'last 30 days' },
    cost: { value: '$45.60', change: 28.9, period: 'last 30 days' },
    efficiency: { value: '92%', change: 3.1, period: 'success rate' },
  },
  sparklineData: [
    { day: 'Mon', value: 120 },
    { day: 'Tue', value: 132 },
    { day: 'Wed', value: 101 },
    { day: 'Thu', value: 134 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 230 },
    { day: 'Sun', value: 210 },
  ],
  languageData: [
    { language: 'TypeScript', percentage: 45.2 },
    { language: 'JavaScript', percentage: 23.8 },
    { language: 'Python', percentage: 15.4 },
    { language: 'Go', percentage: 8.9 },
    { language: 'Rust', percentage: 6.7 },
  ],
}

export function OverviewDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Key metrics and insights across all analytics sources
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          Key Performance Indicators
        </h2>
        <DashboardGrid cols={4} gap="sm">
          <StatsCard
            title="Monthly Visitors"
            value={mockOverviewData.websiteStats.visitors.value.toLocaleString()}
            change={{
              value: mockOverviewData.websiteStats.visitors.change,
              period: mockOverviewData.websiteStats.visitors.period,
            }}
            icon={<Users />}
            compact
          />
          <StatsCard
            title="Coding Hours"
            value={mockOverviewData.codingStats.totalHours.value}
            change={{
              value: mockOverviewData.codingStats.totalHours.change,
              period: mockOverviewData.codingStats.totalHours.period,
            }}
            icon={<Clock />}
            compact
          />
          <StatsCard
            title="AI Tokens"
            value={mockOverviewData.aiUsage.tokens.value}
            change={{
              value: mockOverviewData.aiUsage.tokens.change,
              period: mockOverviewData.aiUsage.tokens.period,
            }}
            icon={<Zap />}
            compact
          />
          <StatsCard
            title="Git Commits"
            value={mockOverviewData.codingStats.commits.value}
            change={{
              value: mockOverviewData.codingStats.commits.change,
              period: mockOverviewData.codingStats.commits.period,
            }}
            icon={<GitCommit />}
            compact
          />
        </DashboardGrid>
      </div>

      {/* Activity & Trends */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          Activity Trends
        </h2>
        <DashboardGrid cols={3} gap="md">
          <GridItem span={2}>
            <CompactCard title="Weekly Activity Pattern" padding="sm">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Peak day:</span>
                    <span className="ml-2 font-medium">Saturday</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg daily:</span>
                    <span className="ml-2 font-medium">154 events</span>
                  </div>
                </div>
                <CompactAreaChart
                  data={mockOverviewData.sparklineData}
                  index="day"
                  categories={['value']}
                  height={180}
                  showGrid={false}
                />
              </div>
            </CompactCard>
          </GridItem>
          <GridItem>
            <CompactCard title="Language Distribution" padding="sm">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Top 5 languages this month
                </div>
                <CompactPieChart
                  data={mockOverviewData.languageData}
                  nameKey="language"
                  valueKey="percentage"
                  height={180}
                  innerRadius={30}
                />
              </div>
            </CompactCard>
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Quick Stats Grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          Performance Metrics
        </h2>
        <DashboardGrid cols={6} gap="sm">
          <GridItem span={2}>
            <CompactCard padding="sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Page Views</span>
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg font-bold">{mockOverviewData.websiteStats.pageViews.value.toLocaleString()}</span>
                  <span className="text-xs text-green-600">+{mockOverviewData.websiteStats.pageViews.change}%</span>
                </div>
                <MiniSparkline
                  data={mockOverviewData.sparklineData}
                  dataKey="value"
                  height={30}
                />
              </div>
            </CompactCard>
          </GridItem>

          <GridItem span={2}>
            <CompactCard padding="sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Bounce Rate</span>
                  <MousePointer className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg font-bold">{mockOverviewData.websiteStats.bounceRate.value}</span>
                  <span className="text-xs text-green-600">{mockOverviewData.websiteStats.bounceRate.change}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  vs {mockOverviewData.websiteStats.bounceRate.period}
                </div>
              </div>
            </CompactCard>
          </GridItem>

          <GridItem span={2}>
            <CompactCard padding="sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">AI Efficiency</span>
                  <BarChart3 className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg font-bold">{mockOverviewData.aiUsage.efficiency.value}</span>
                  <span className="text-xs text-green-600">+{mockOverviewData.aiUsage.efficiency.change}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {mockOverviewData.aiUsage.efficiency.period}
                </div>
              </div>
            </CompactCard>
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex space-x-2 text-xs">
            <button className="text-blue-600 hover:text-blue-700">
              Export Data
            </button>
            <span className="text-muted-foreground">•</span>
            <button className="text-blue-600 hover:text-blue-700">
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}