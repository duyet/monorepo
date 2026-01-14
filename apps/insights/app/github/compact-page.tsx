import { Calendar, Code, GitCommit, GitFork, Star } from "lucide-react";
import { Suspense } from "react";
import { CompactAreaChart } from "@/components/charts/CompactChart";
import { Breadcrumb } from "@/components/navigation/CompactNavigation";
import { CompactCard, StatsCard } from "@/components/ui/CompactCard";
import { DashboardGrid, GridItem } from "@/components/ui/DashboardGrid";
import { QuickFilters } from "@/components/ui/DateRangeSelector";
import { GithubActivity } from "./activity";
import { GithubCard } from "./card";
import { CommitTimeline } from "./commit-timeline";
import { GitHubLanguageStats } from "./language-stats";
import { RepoTrends } from "./repo-trends";
import { Repos } from "./repos";

const owner = "duyet";

export const metadata = {
  title: "GitHub Insights @duyet",
  description: "GitHub repository analytics and development activity insights",
};

// Static generation only
export const dynamic = "force-static";

// Mock data for quick overview cards
const mockGitHubStats = {
  totalCommits: { value: 2847, change: 18.5, period: "last 30 days" },
  totalStars: { value: 1234, change: 12.3, period: "last 30 days" },
  totalRepos: { value: 45, change: 6.7, period: "public repos" },
  totalForks: { value: 289, change: 15.1, period: "last 30 days" },
  weeklyActivity: [
    { day: "Mon", commits: 12 },
    { day: "Tue", commits: 15 },
    { day: "Wed", commits: 8 },
    { day: "Thu", commits: 22 },
    { day: "Fri", commits: 18 },
    { day: "Sat", commits: 5 },
    { day: "Sun", commits: 3 },
  ],
};

export default function CompactGitHubPage() {
  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="border-b pb-4">
        <Breadcrumb
          items={[{ label: "Dashboard", href: "/" }, { label: "Development" }]}
        />
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Development Analytics
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              GitHub repository insights and development activity
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
          Development Overview
        </h2>
        <DashboardGrid cols={4} gap="sm">
          <StatsCard
            title="Total Commits"
            value={mockGitHubStats.totalCommits.value.toLocaleString()}
            change={{
              value: mockGitHubStats.totalCommits.change,
              period: mockGitHubStats.totalCommits.period,
            }}
            icon={<GitCommit />}
            compact
          />
          <StatsCard
            title="Repository Stars"
            value={mockGitHubStats.totalStars.value.toLocaleString()}
            change={{
              value: mockGitHubStats.totalStars.change,
              period: mockGitHubStats.totalStars.period,
            }}
            icon={<Star />}
            compact
          />
          <StatsCard
            title="Public Repos"
            value={mockGitHubStats.totalRepos.value}
            change={{
              value: mockGitHubStats.totalRepos.change,
              period: mockGitHubStats.totalRepos.period,
            }}
            icon={<Code />}
            compact
          />
          <StatsCard
            title="Total Forks"
            value={mockGitHubStats.totalForks.value}
            change={{
              value: mockGitHubStats.totalForks.change,
              period: mockGitHubStats.totalForks.period,
            }}
            icon={<GitFork />}
            compact
          />
        </DashboardGrid>
      </div>

      {/* Main Analytics Grid */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Activity Analysis
        </h2>
        <DashboardGrid cols={3} gap="md">
          {/* Weekly Activity Pattern */}
          <GridItem span={2}>
            <CompactCard
              title="Weekly Commit Pattern"
              header={
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Weekly Commit Pattern
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Last 7 days</span>
                  </div>
                </div>
              }
              padding="sm"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Peak day:</span>
                    <span className="ml-2 font-medium">Thursday</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg daily:</span>
                    <span className="ml-2 font-medium">12 commits</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total week:</span>
                    <span className="ml-2 font-medium">83 commits</span>
                  </div>
                </div>
                <CompactAreaChart
                  data={mockGitHubStats.weeklyActivity}
                  index="day"
                  categories={["commits"]}
                  height={160}
                  showGrid={false}
                />
              </div>
            </CompactCard>
          </GridItem>

          {/* Language Stats */}
          <GridItem>
            <CompactCard title="Language Distribution" padding="sm">
              <Suspense
                fallback={
                  <div className="h-40 animate-pulse rounded bg-muted" />
                }
              >
                <GitHubLanguageStats />
              </Suspense>
            </CompactCard>
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Repository Insights */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Repository Insights
        </h2>
        <DashboardGrid cols={2} gap="md">
          {/* Repository Trends */}
          <GridItem>
            <CompactCard title="Trending Repositories" padding="sm">
              <Suspense
                fallback={
                  <div className="h-48 animate-pulse rounded bg-muted" />
                }
              >
                <RepoTrends />
              </Suspense>
            </CompactCard>
          </GridItem>

          {/* Profile Overview */}
          <GridItem>
            <CompactCard title="Profile Statistics" padding="sm">
              <Suspense
                fallback={
                  <div className="h-48 animate-pulse rounded bg-muted" />
                }
              >
                <GithubCard owner={owner} />
              </Suspense>
            </CompactCard>
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Detailed Sections */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Detailed Analytics
        </h2>
        <div className="space-y-4">
          {/* Commit Timeline */}
          <CompactCard title="Commit Timeline" padding="sm">
            <Suspense
              fallback={<div className="h-40 animate-pulse rounded bg-muted" />}
            >
              <CommitTimeline />
            </Suspense>
          </CompactCard>

          {/* Repository List */}
          <CompactCard title="Repository Overview" padding="sm">
            <Suspense
              fallback={<div className="h-64 animate-pulse rounded bg-muted" />}
            >
              <Repos owner={owner} />
            </Suspense>
          </CompactCard>

          {/* Activity Details */}
          <CompactCard title="Development Activity" padding="sm">
            <Suspense
              fallback={<div className="h-48 animate-pulse rounded bg-muted" />}
            >
              <GithubActivity owner={owner} />
            </Suspense>
          </CompactCard>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            Data from GitHub API • Updated every hour • {owner}'s public
            repositories
          </div>
          <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-700">
              View on GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
