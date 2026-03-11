/**
 * GitHub comparison utilities
 * Fetches and compares metrics between two periods
 */

import { calculateDelta } from "@/lib/comparison";
import { fetchAllEvents, fetchAllRepositories } from "./github-utils";
import type { PeriodDays } from "@/lib/periods";

export interface GitHubMetrics {
  totalCommits: number;
  activeDays: number;
  topLanguage: string;
  topRepo: string;
}

export interface GitHubComparisonMetrics {
  totalCommits: {
    value1: number;
    value2: number;
    delta: ReturnType<typeof calculateDelta>;
  };
  activeDays: {
    value1: number;
    value2: number;
    delta: ReturnType<typeof calculateDelta>;
  };
  topLanguage: {
    value1: string;
    value2: string;
  };
  topRepo: {
    value1: string;
    value2: string;
  };
}

/**
 * Get GitHub metrics for a specific period
 */
async function getGitHubMetrics(
  days: number | "all"
): Promise<GitHubMetrics> {
  const owner = "duyet";

  try {
    // Calculate date range
    const now = new Date();
    const startDate =
      days === "all"
        ? new Date(2020, 0, 1)
        : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    console.log(`Fetching GitHub metrics for ${days} days (${startDate.toISOString()} to ${now.toISOString()})`);

    // Fetch events and repositories in parallel
    const [events, repos] = await Promise.all([
      fetchAllEvents(owner),
      fetchAllRepositories(owner),
    ]);

    // Filter events by date range
    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.created_at);
      return eventDate >= startDate && eventDate <= now;
    });

    // Count push events (commits)
    const pushEvents = filteredEvents.filter(
      (event) => event.type === "PushEvent"
    );
    const totalCommits = pushEvents.reduce(
      (sum, event) => sum + (event.payload?.commits?.length || 1),
      0
    );

    // Calculate active days (unique days with commits)
    const activeDaysSet = new Set<string>();
    pushEvents.forEach((event) => {
      const eventDate = new Date(event.created_at);
      activeDaysSet.add(eventDate.toISOString().split("T")[0]);
    });
    const activeDays = activeDaysSet.size;

    // Get top language from repositories
    const languageBytes: Record<string, number> = {};
    const topRepos = repos.slice(0, 20).filter((repo) => !repo.archived && repo.name);

    // Aggregate languages (note: this fetches additional data from GitHub API)
    if (process.env.GITHUB_TOKEN && topRepos.length > 0) {
      try {
        const languageResults = await Promise.all(
          topRepos.map(async (repo) => {
            try {
              const langResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo.name}/languages`,
                {
                  headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                  },
                  cache: "force-cache",
                }
              );

              if (langResponse.ok) {
                return (await langResponse.json()) as Record<string, number>;
              }
              return {};
            } catch {
              return {};
            }
          })
        );

        for (const languages of languageResults) {
          Object.entries(languages).forEach(([lang, bytes]) => {
            languageBytes[lang] = (languageBytes[lang] || 0) + (bytes as number);
          });
        }
      } catch (error) {
        console.warn("Failed to fetch language data:", error);
      }
    }

    // Find top language
    let topLanguage = "Unknown";
    let maxBytes = 0;
    Object.entries(languageBytes).forEach(([lang, bytes]) => {
      if (bytes > maxBytes) {
        maxBytes = bytes;
        topLanguage = lang;
      }
    });

    // Get top repo (by stars)
    const sortedRepos = [...repos].sort(
      (a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)
    );
    const topRepo = sortedRepos[0]?.name || "None";

    return {
      totalCommits,
      activeDays,
      topLanguage,
      topRepo,
    };
  } catch (error) {
    console.error("Error fetching GitHub metrics:", error);
    return {
      totalCommits: 0,
      activeDays: 0,
      topLanguage: "Unknown",
      topRepo: "None",
    };
  }
}

/**
 * Get GitHub comparison metrics for two periods
 */
export async function getGitHubComparison(
  days1: PeriodDays,
  days2: PeriodDays
): Promise<GitHubComparisonMetrics> {
  const [metrics1, metrics2] = await Promise.all([
    getGitHubMetrics(days1),
    getGitHubMetrics(days2),
  ]);

  return {
    totalCommits: {
      value1: metrics1.totalCommits,
      value2: metrics2.totalCommits,
      delta: calculateDelta(metrics1.totalCommits, metrics2.totalCommits),
    },
    activeDays: {
      value1: metrics1.activeDays,
      value2: metrics2.activeDays,
      delta: calculateDelta(metrics1.activeDays, metrics2.activeDays),
    },
    topLanguage: {
      value1: metrics1.topLanguage,
      value2: metrics2.topLanguage,
    },
    topRepo: {
      value1: metrics1.topRepo,
      value2: metrics2.topRepo,
    },
  };
}
