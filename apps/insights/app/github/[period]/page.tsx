import { Suspense } from "react";
import { generatePeriodStaticParams, getPeriodConfig } from "@/lib/periods";
import { SkeletonCard } from "../../../components/SkeletonCard";
import { GithubActivity } from "../activity";
import { GithubCard } from "../card";
import { CommitTimeline } from "../commit-timeline";
import { GitHubLanguageStats } from "../language-stats";
import { RepoTrends } from "../repo-trends";
import { Repos } from "../repos";

const owner = "duyet";

export const dynamic = "force-static";

// Generate static pages for all time periods
export function generateStaticParams() {
  return generatePeriodStaticParams();
}

interface PageProps {
  params: Promise<{
    period: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { period } = await params;
  const config = getPeriodConfig(period);
  const isAllTime = config.days === "all";

  return {
    title: `GitHub Insights @duyet - ${config.label}`,
    description: isAllTime
      ? "All-time GitHub repository analytics and insights"
      : `GitHub repository analytics for the last ${config.label}`,
  };
}

export default async function GitHubPeriodPage({ params }: PageProps) {
  const { period } = await params;
  const config = getPeriodConfig(period);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">GitHub Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Repository insights and development activity • {config.label}
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Language Distribution */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Language Distribution</h2>
            <p className="text-sm text-muted-foreground">
              Programming languages and repository statistics
            </p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <GitHubLanguageStats />
          </Suspense>
        </div>

        {/* Repository Trends */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Repository Trends</h2>
            <p className="text-sm text-muted-foreground">
              Stars, forks, and trending repositories
            </p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <RepoTrends />
          </Suspense>
        </div>

        {/* Repository Analytics */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Repository Overview</h2>
            <p className="text-sm text-muted-foreground">
              Public repositories and statistics
            </p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <Repos owner={owner} />
          </Suspense>
        </div>

        {/* Commit Timeline */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Commit Activity</h2>
            <p className="text-sm text-muted-foreground">
              Weekly commit frequency and patterns
            </p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <CommitTimeline />
          </Suspense>
        </div>

        {/* Development Activity */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Development Activity</h2>
            <p className="text-sm text-muted-foreground">
              Recent contributions and activity patterns
            </p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <GithubActivity owner={owner} />
          </Suspense>
        </div>

        {/* Profile Stats */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Profile Statistics</h2>
            <p className="text-sm text-muted-foreground">
              Overall GitHub profile metrics
            </p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <GithubCard owner={owner} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
