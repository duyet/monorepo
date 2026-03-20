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
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">GitHub Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Repository insights and development activity
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Language Distribution</h2>
            <p className="text-sm text-muted-foreground">
              Programming languages and repository statistics
            </p>
          </div>
          <GitHubLanguageStatsView stats={languageStats} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Repository Trends</h2>
            <p className="text-sm text-muted-foreground">
              Stars, forks, and trending repositories
            </p>
          </div>
          <RepoTrendsView stats={trendStats} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Repository Overview</h2>
            <p className="text-sm text-muted-foreground">
              Public repositories and statistics
            </p>
          </div>
          <ReposView owner={OWNER} repos={repos} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Commit Activity</h2>
            <p className="text-sm text-muted-foreground">
              Weekly commit frequency and patterns
            </p>
          </div>
          <CommitTimelineView stats={commitStats} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Development Activity</h2>
            <p className="text-sm text-muted-foreground">
              Recent contributions and activity patterns
            </p>
          </div>
          <GithubActivityView owner={OWNER} repos={stars} />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Profile Statistics</h2>
            <p className="text-sm text-muted-foreground">
              Overall GitHub profile metrics
            </p>
          </div>
          <GithubCard owner={OWNER} />
        </div>
      </div>
    </div>
  );
}
