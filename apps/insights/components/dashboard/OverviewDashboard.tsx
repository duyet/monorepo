import {
  BarChart3,
  Clock,
  Eye,
  GitCommit,
  MousePointer,
  Server,
  Users,
  Zap,
} from "lucide-react";
import { getCCUsageMetrics } from "@/app/ai/ccusage-utils";
import { getWakaTimeMetrics } from "@/app/wakatime/wakatime-utils";
import {
  CompactAreaChart,
  CompactPieChart,
} from "@/components/charts/LazyCharts";
import { CompactCard } from "@/components/ui/CompactCard";

// Format tokens with B/M/K suffixes (consistent with AI tab)
function formatTokens(tokens: number): string {
  if (tokens >= 1000000000) {
    return `${(tokens / 1000000000).toFixed(1)}B`;
  }
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

// Mock data for demonstration - replace with real data fetching
const mockOverviewData = {
  websiteStats: {
    visitors: { value: 12543, change: 15.2, period: "last 30 days" },
    pageViews: { value: 34567, change: 8.7, period: "last 30 days" },
    bounceRate: { value: "32.4%", change: -5.1, period: "last 30 days" },
    avgSession: { value: "3m 24s", change: 12.3, period: "last 30 days" },
  },
  commits: { value: 247, change: 18.5, period: "last 30 days" },
  languages: { value: 8, change: 0, period: "active languages" },
  productivity: { value: "87%", change: 5.2, period: "vs last month" },
  aiSessions: { value: 89, change: 12.4, period: "last 30 days" },
  aiCost: { value: "$45.60", change: 28.9, period: "last 30 days" },
  aiEfficiency: { value: "92%", change: 3.1, period: "success rate" },
  sparklineData: [
    { day: "Mon", value: 120 },
    { day: "Tue", value: 132 },
    { day: "Wed", value: 101 },
    { day: "Thu", value: 134 },
    { day: "Fri", value: 90 },
    { day: "Sat", value: 230 },
    { day: "Sun", value: 210 },
  ],
  languageData: [
    { language: "TypeScript", percentage: 45.2 },
    { language: "JavaScript", percentage: 23.8 },
    { language: "Python", percentage: 15.4 },
    { language: "Go", percentage: 8.9 },
    { language: "Rust", percentage: 6.7 },
  ],
};

export async function OverviewDashboard() {
  // Fetch real data for AI tokens and Coding hours (consistent with AI/WakaTime tabs)
  const [aiMetrics, wakaTimeMetrics] = await Promise.allSettled([
    getCCUsageMetrics(30),
    getWakaTimeMetrics(30),
  ]);

  const aiTokens =
    aiMetrics.status === "fulfilled" && aiMetrics.value
      ? formatTokens(aiMetrics.value.totalTokens)
      : mockOverviewData.aiSessions.value; // Fallback to mock if fetch fails

  const codingHours =
    wakaTimeMetrics.status === "fulfilled" && wakaTimeMetrics.value
      ? wakaTimeMetrics.value.totalHours.toFixed(1)
      : mockOverviewData.commits.value; // Fallback to mock if fetch fails
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
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Key Performance Indicators • Last 30 Days
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CompactCard padding="sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>Monthly Visitors</span>
              </div>
              <div className="text-lg font-semibold">
                {mockOverviewData.websiteStats.visitors.value.toLocaleString()}
              </div>
              <div className="text-xs text-green-600">
                +{mockOverviewData.websiteStats.visitors.change}%
              </div>
            </div>
          </CompactCard>

          <CompactCard padding="sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Coding Hours</span>
              </div>
              <div className="text-lg font-semibold">{codingHours}</div>
              <div className="text-xs text-green-600">vs last 30 days</div>
            </div>
          </CompactCard>

          <CompactCard padding="sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>AI Tokens</span>
              </div>
              <div className="text-lg font-semibold">{aiTokens}</div>
              <div className="text-xs text-green-600">vs last 30 days</div>
            </div>
          </CompactCard>

          <CompactCard padding="sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <GitCommit className="h-3 w-3" />
                <span>Git Commits</span>
              </div>
              <div className="text-lg font-semibold">
                {mockOverviewData.commits.value}
              </div>
              <div className="text-xs text-green-600">
                +{mockOverviewData.commits.change}%
              </div>
            </div>
          </CompactCard>
        </div>
      </div>

      {/* Activity Trends */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Activity Trends
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CompactCard title="Weekly Activity Pattern" padding="sm">
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Showing your development activity across the week, tracking
                  commits, coding sessions, and project events
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
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
                  categories={["value"]}
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
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Performance Metrics
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CompactCard padding="sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Page Views
                </span>
                <Eye className="text-muted-foreground/60 h-3 w-3" />
              </div>
              <div className="text-xl font-semibold">
                {mockOverviewData.websiteStats.pageViews.value.toLocaleString()}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-green-600">
                  +{mockOverviewData.websiteStats.pageViews.change}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs last 30 days
                </span>
              </div>
            </div>
          </CompactCard>

          <CompactCard padding="sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Bounce Rate
                </span>
                <MousePointer className="text-muted-foreground/60 h-3 w-3" />
              </div>
              <div className="text-xl font-semibold">
                {mockOverviewData.websiteStats.bounceRate.value}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-green-600">
                  {mockOverviewData.websiteStats.bounceRate.change}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs {mockOverviewData.websiteStats.bounceRate.period}
                </span>
              </div>
            </div>
          </CompactCard>

          <CompactCard padding="sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  AI Efficiency
                </span>
                <BarChart3 className="text-muted-foreground/60 h-3 w-3" />
              </div>
              <div className="text-xl font-semibold">
                {mockOverviewData.aiEfficiency.value}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-green-600">
                  +{mockOverviewData.aiEfficiency.change}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {mockOverviewData.aiEfficiency.period}
                </span>
              </div>
            </div>
          </CompactCard>
        </div>
      </div>

      {/* Homelab Overview */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Homelab Overview</h2>
        <CompactCard padding="sm">
          <a
            href="https://homelab.duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                  <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium group-hover:text-blue-600">
                    View on homelab dashboard
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Infrastructure monitoring and homelab documentation
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                →
              </div>
            </div>
          </a>
        </CompactCard>
      </div>

      {/* Last Updated Footer */}
      <div className="border-t pt-3">
        <div className="text-xs text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
          })}
        </div>
      </div>
    </div>
  );
}
