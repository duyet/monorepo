import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface GitHubContributionDay {
  contributionCount: number;
  contributionLevel: string;
  date: string;
}

interface GitHubContributionsResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: GitHubContributionDay[];
          }>;
        };
      };
    };
  };
}

interface GitHubContributionRecord {
  date: string;
  username: string;
  contribution_count: number;
  contribution_level: string;
}

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const CONTRIBUTIONS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              contributionLevel
              date
            }
          }
        }
      }
    }
  }
`;

export class GitHubSyncer extends BaseSyncer<
  GitHubContributionsResponse,
  GitHubContributionRecord
> {
  private username: string;

  constructor(client: ClickHouseClient, username?: string) {
    super(client, "github");
    this.username = username || process.env.GITHUB_USERNAME || "duyet";
  }

  protected getTableName(): string {
    return "monorepo_github";
  }

  protected async fetchFromApi(
    _options: SyncOptions
  ): Promise<GitHubContributionsResponse[]> {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    this.logger.info(
      `Fetching GitHub contributions for user: ${this.username}`
    );

    const response = await this.withRetry(async () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "data-sync-app",
      };

      // Add auth if token is available (optional for public data)
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(GITHUB_GRAPHQL_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: CONTRIBUTIONS_QUERY,
          variables: { username: this.username },
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error(
            "GitHub API authentication failed: Invalid or expired token"
          );
        }
        if (res.status === 403) {
          throw new Error("GitHub API rate limit exceeded or access forbidden");
        }
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (data.errors) {
        throw new Error(
          `GitHub GraphQL error: ${data.errors[0]?.message || "Unknown error"}`
        );
      }

      if (!data.data?.user) {
        throw new Error(`GitHub user not found: ${this.username}`);
      }

      return data;
    });

    return [response];
  }

  protected async transform(
    data: GitHubContributionsResponse[]
  ): Promise<GitHubContributionRecord[]> {
    const records: GitHubContributionRecord[] = [];

    for (const response of data) {
      const weeks =
        response.data.user.contributionsCollection.contributionCalendar.weeks;

      for (const week of weeks) {
        for (const day of week.contributionDays) {
          records.push({
            date: day.date,
            username: this.username,
            contribution_count: day.contributionCount,
            contribution_level: day.contributionLevel,
          });
        }
      }
    }

    this.logger.info(`Transformed ${records.length} contribution records`);
    return records;
  }
}
