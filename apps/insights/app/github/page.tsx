import { Suspense } from "react";
import { PageLayout, SectionLayout } from "@/components/layouts";
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

// Use dynamic rendering to prevent build failures when GITHUB_TOKEN is not available
// The components handle missing token gracefully by returning empty data
export const dynamic = "auto";
export const revalidate = 3600; // Revalidate every hour when token is available

export default function Page() {
  return (
    <PageLayout
      title="GitHub Analytics"
      description="Repository insights and development activity"
    >
      <SectionLayout
        title="Language Distribution"
        description="Programming languages and repository statistics"
      >
        <Suspense
          fallback={
            <div className="animate-pulse h-64 bg-muted rounded-xl" />
          }
        >
          <GitHubLanguageStats />
        </Suspense>
      </SectionLayout>

      <SectionLayout
        title="Repository Trends"
        description="Stars, forks, and trending repositories"
      >
        <Suspense
          fallback={
            <div className="animate-pulse h-64 bg-muted rounded-xl" />
          }
        >
          <RepoTrends />
        </Suspense>
      </SectionLayout>

      <SectionLayout
        title="Repository Overview"
        description="Public repositories and statistics"
      >
        <Suspense
          fallback={
            <div className="animate-pulse h-64 bg-muted rounded-xl" />
          }
        >
          <Repos owner={owner} />
        </Suspense>
      </SectionLayout>

      <SectionLayout
        title="Commit Activity"
        description="Weekly commit frequency and patterns"
      >
        <Suspense
          fallback={
            <div className="animate-pulse h-64 bg-muted rounded-xl" />
          }
        >
          <CommitTimeline />
        </Suspense>
      </SectionLayout>

      <SectionLayout
        title="Development Activity"
        description="Recent contributions and activity patterns"
      >
        <Suspense
          fallback={
            <div className="animate-pulse h-64 bg-muted rounded-xl" />
          }
        >
          <GithubActivity owner={owner} />
        </Suspense>
      </SectionLayout>

      <SectionLayout
        title="Profile Statistics"
        description="Overall GitHub profile metrics"
      >
        <Suspense
          fallback={
            <div className="animate-pulse h-64 bg-muted rounded-xl" />
          }
        >
          <GithubCard owner={owner} />
        </Suspense>
      </SectionLayout>
    </PageLayout>
  );
}
