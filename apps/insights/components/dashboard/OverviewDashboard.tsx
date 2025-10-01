'use client'

import { CompactCard } from '@/components/ui/CompactCard'
import { CompactAreaChart, CompactPieChart } from '@/components/charts/CompactChart'
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
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">
          Key metrics and insights across all analytics sources
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
          Key Performance Indicators • Last 30 Days
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <CompactCard padding="sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>Monthly Visitors</span>
              </div>
              <div className="text-lg font-semibold">{mockOverviewData.websiteStats.visitors.value.toLocaleString()}</div>
              <div className="text-xs text-green-600">+{mockOverviewData.websiteStats.visitors.change}%</div>
            </div>
          </CompactCard>

          <CompactCard padding="sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Coding Hours</span>
              </div>
              <div className="text-lg font-semibold">{mockOverviewData.codingStats.totalHours.value}</div>
              <div className="text-xs text-green-600">+{mockOverviewData.codingStats.totalHours.change}%</div>
            </div>
          </CompactCard>

          <CompactCard padding="sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>AI Tokens</span>
              </div>
              <div className="text-lg font-semibold">{mockOverviewData.aiUsage.tokens.value}</div>
              <div className="text-xs text-green-600">+{mockOverviewData.aiUsage.tokens.change}%</div>
            </div>
          </CompactCard>

          <CompactCard padding="sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <GitCommit className="h-3 w-3" />
                <span>Git Commits</span>
              </div>
              <div className="text-lg font-semibold">{mockOverviewData.codingStats.commits.value}</div>
              <div className="text-xs text-green-600">+{mockOverviewData.codingStats.commits.change}%</div>
            </div>
          </CompactCard>
        </div>
      </div>

      {/* Activity Trends */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
          Activity Trends
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <CompactCard title="Weekly Activity Pattern" padding="sm">
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Showing your development activity across the week, tracking commits, coding sessions, and project events
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Peak day:</span>
                    <span className="font-medium">Saturday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Avg daily:</span>
                    <span className="font-medium">154 events</span>
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
          </div>

          <CompactCard title="Language Distribution" padding="sm">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Top 5 languages this month (by percentage of time)
              </div>
              <CompactPieChart
                data={mockOverviewData.languageData}
                nameKey="language"
                valueKey="percentage"
                height={180}
                innerRadius={35}
              />
            </div>
          </CompactCard>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
          Performance Metrics
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <CompactCard padding="sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Page Views</span>
                <Eye className="h-3 w-3 text-muted-foreground/60" />
              </div>
              <div className="text-xl font-semibold">{mockOverviewData.websiteStats.pageViews.value.toLocaleString()}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-green-600">+{mockOverviewData.websiteStats.pageViews.change}%</span>
                <span className="text-xs text-muted-foreground">vs last 30 days</span>
              </div>
            </div>
          </CompactCard>

          <CompactCard padding="sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Bounce Rate</span>
                <MousePointer className="h-3 w-3 text-muted-foreground/60" />
              </div>
              <div className="text-xl font-semibold">{mockOverviewData.websiteStats.bounceRate.value}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-green-600">{mockOverviewData.websiteStats.bounceRate.change}%</span>
                <span className="text-xs text-muted-foreground">vs {mockOverviewData.websiteStats.bounceRate.period}</span>
              </div>
            </div>
          </CompactCard>

          <CompactCard padding="sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">AI Efficiency</span>
                <BarChart3 className="h-3 w-3 text-muted-foreground/60" />
              </div>
              <div className="text-xl font-semibold">{mockOverviewData.aiUsage.efficiency.value}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-green-600">+{mockOverviewData.aiUsage.efficiency.change}%</span>
                <span className="text-xs text-muted-foreground">{mockOverviewData.aiUsage.efficiency.period}</span>
              </div>
            </div>
          </CompactCard>
        </div>
      </div>

      {/* Last Updated Footer */}
      <div className="pt-3 border-t">
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}