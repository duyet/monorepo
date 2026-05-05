import type { GithubRepo } from "@duyet/interfaces";
import { createFileRoute } from "@tanstack/react-router";
import { fetchGithubStars, GithubActivityView } from "@/app/github/activity";
import { GithubCard } from "@/app/github/card";
import {
  CommitTimelineView,
  fetchCommitStats,
} from "@/app/github/commit-timeline";
import {
  fetchLanguageStats,
  GitHubLanguageStatsView,
} from "@/app/github/language-stats";
import { fetchTrendStats, RepoTrendsView } from "@/app/github/repo-trends";
import { fetchGithubRepos, ReposView } from "@/app/github/repos";
import {
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";

const OWNER = "duyet";

export const Route = createFileRoute("/github/")({
  loader: async () => {
    const [languageStats, repos, commitStats, trendStats, stars] =
      await Promise.allSettled([
        fetchLanguageStats(OWNER),
        fetchGithubRepos(
          OWNER,
          ["clickhouse-monitoring", "pricetrack", "grant-rs", "charts"],
          [
            "awesome-web-scraper",
            "vietnamese-wordlist",
            "vietnamese-namedb",
            "vietnamese-frontend-interview-questions",
            "opencv-car-detection",
            "saveto",
            "firebase-shorten-url",
            "google-search-crawler",
          ],
          12
        ),
        fetchCommitStats(OWNER),
        fetchTrendStats(OWNER),
        fetchGithubStars(OWNER),
      ]);

    return {
      languageStats:
        languageStats.status === "fulfilled" ? languageStats.value : null,
      repos: repos.status === "fulfilled" ? repos.value : ([] as GithubRepo[]),
      commitStats:
        commitStats.status === "fulfilled" ? commitStats.value : null,
      trendStats: trendStats.status === "fulfilled" ? trendStats.value : null,
      stars: stars.status === "fulfilled" ? stars.value : ([] as GithubRepo[]),
    };
  },
  head: () => ({
    meta: [
      { title: "GitHub Insights @duyet" },
      {
        name: "description",
        content:
          "GitHub repository analytics and development activity insights",
      },
    ],
  }),
  component: GithubPage,
});

function GithubPage() {
  const { languageStats, repos, commitStats, trendStats, stars } =
    Route.useLoaderData();

  return (
    <div className="space-y-6">
      <InsightsPageHeader
        badge="GitHub"
        title="Repository analytics"
        description="Repository trends, commit activity, language mix, and profile-level development signals."
      />

      <div className="space-y-6">
        <InsightsSection
          title="Language distribution"
          description="Programming languages and repository statistics."
        >
          <GitHubLanguageStatsView stats={languageStats} />
        </InsightsSection>

        <InsightsSection
          title="Repository trends"
          description="Stars, forks, and trending repositories."
        >
          <RepoTrendsView stats={trendStats} />
        </InsightsSection>

        <InsightsSection
          title="Repository overview"
          description="Public repositories and key metrics."
        >
          <ReposView owner={OWNER} repos={repos} />
        </InsightsSection>

        <InsightsSection
          title="Commit activity"
          description="Weekly commit frequency and patterns."
        >
          <CommitTimelineView stats={commitStats} />
        </InsightsSection>

        <InsightsSection
          title="Development activity"
          description="Recent contributions and activity patterns."
        >
          <GithubActivityView owner={OWNER} repos={stars} />
        </InsightsSection>

        <InsightsSection
          title="Profile statistics"
          description="Overall GitHub profile metrics."
        >
          <GithubCard owner={OWNER} />
        </InsightsSection>
      </div>
    </div>
  );
}
