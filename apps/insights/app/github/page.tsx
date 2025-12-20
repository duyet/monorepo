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
      footer={
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      }
    >
      <SectionLayout
        title="Language Distribution"
        description="Programming languages and repository statistics"
      >
        <GitHubLanguageStats />
      </SectionLayout>

      <SectionLayout
        title="Repository Trends"
        description="Stars, forks, and trending repositories"
      >
        <RepoTrends />
      </SectionLayout>

      <SectionLayout
        title="Repository Overview"
        description="Public repositories and statistics"
      >
        <Repos owner={owner} />
      </SectionLayout>

      <SectionLayout
        title="Commit Activity"
        description="Weekly commit frequency and patterns"
      >
        <CommitTimeline />
      </SectionLayout>

      <SectionLayout
        title="Development Activity"
        description="Recent contributions and activity patterns"
      >
        <GithubActivity owner={owner} />
      </SectionLayout>

      <SectionLayout
        title="Profile Statistics"
        description="Overall GitHub profile metrics"
      >
        <GithubCard owner={owner} />
      </SectionLayout>
    </PageLayout>
  );
}
