import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface RawCommitRecord {
  date: string;
  repo: string;
  owner: string;
  sha: string;
  message: string;
  author_email: string;
  author_name: string;
  additions: number;
  deletions: number;
  changed_files: number;
  co_authors: string[];
  has_co_author: number;
  is_ai: number;
  committed_at: string;
}

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

// GraphQL query with date filtering for efficient backfill
const REPO_COMMIT_QUERY = `
  query($owner: String!, $name: String!, $after: String, $since: GitTimestamp) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 100, after: $after, since: $since) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  oid: sha
                  message
                  author {
                    email
                    name
                    date
                  }
                  additions
                  deletions
                  changedFiles
                  committedDate
                  coAuthors(first: 5) {
                    edges {
                      node {
                        name
                        email
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Check if a commit is AI-generated based on author, email, and co-authors
 */
function isAIAuthor(email: string, message: string, hasCoAuthor: boolean): boolean {
  if (hasCoAuthor) {
    return true;
  }

  // GitHub bot emails
  if (email.endsWith("@users.noreply.github.com")) {
    return true;
  }

  // Common AI assistant patterns
  const aiPatterns = [
    "@anthropic.",
    "@claude.",
    "@openai.",
    "@cursor-",
    "@aider.",
    "github-actions[bot]",
    "dependabot[bot]",
    "renovate[bot]",
    "semantic-release",
  ];

  if (aiPatterns.some((pattern) => email.includes(pattern))) {
    return true;
  }

  // Check commit message for AI/bot indicators
  const lowerMessage = message.toLowerCase();
  if (
    lowerMessage.includes("[bot]") ||
    lowerMessage.includes("[auto]") ||
    lowerMessage.includes("[ci]") ||
    lowerMessage.includes("[automatic]") ||
    lowerMessage.includes("co-authored-by:")
  ) {
    return true;
  }

  return false;
}

export class AICodePercentageSyncer extends BaseSyncer<any, RawCommitRecord> {
  private owner: string;

  constructor(client: ClickHouseClient, owner?: string) {
    super(client, "ai-code-percentage");
    this.owner = owner || process.env.GITHUB_USERNAME || "duyet";
  }

  protected getTableName(): string {
    return "github_commits_raw";
  }

  protected async fetchFromApi(options: SyncOptions): Promise<RawCommitRecord[]> {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    this.logger.info(`Fetching raw commits for user: ${this.owner}`);

    // Get date range from options
    const sinceDate = options.startDate
      ? options.startDate.toISOString()
      : undefined;

    this.logger.info(
      `Date range: ${sinceDate ? `since ${sinceDate}` : "all time"}`
    );

    // Fetch all repositories
    const repos = await this.fetchAllRepos(token);

    if (repos.length === 0) {
      this.logger.warn("No repositories found");
      return [];
    }

    this.logger.info(`Processing ${repos.length} repositories`);

    const allCommits: RawCommitRecord[] = [];
    let totalFetched = 0;

    // Process repos in batches to manage rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < repos.length; i += BATCH_SIZE) {
      const batch = repos.slice(i, i + BATCH_SIZE);
      this.logger.info(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          repos.length / BATCH_SIZE
        )} (${batch.length} repos)`
      );

      for (const repo of batch) {
        const commits = await this.fetchAllCommits(token, repo, sinceDate);
        allCommits.push(...commits);
        totalFetched += commits.length;

        this.logger.info(
          `Fetched ${commits.length} commits from ${repo} (total: ${totalFetched})`
        );

        // Small delay between repos to avoid rate limits
        await this.sleep(100);
      }

      // Longer delay between batches
      if (i + BATCH_SIZE < repos.length) {
        this.logger.info("Waiting to avoid rate limits...");
        await this.sleep(2000);
      }
    }

    this.logger.info(`Total commits fetched: ${allCommits.length}`);

    return allCommits;
  }

  private async fetchAllRepos(token: string): Promise<string[]> {
    const repos: string[] = [];
    let after: string | null = null;

    while (true) {
      const reposQuery = `
        query($login: String!, $after: String) {
          user(login: $login) {
            repositories(first: 100, after: $after, ownerAffiliations: OWNER) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      `;

      try {
        const response = await this.withRetry(async () => {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "User-Agent": "data-sync-app",
          };

          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const res = await fetch(GITHUB_GRAPHQL_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: reposQuery,
              variables: { login: this.owner, after },
            }),
          });

          if (!res.ok) {
            throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
          }

          return res.json();
        });

        const repoData = response.data?.user?.repositories;
        if (!repoData) {
          this.logger.warn("No repositories found in response");
          break;
        }

        const edges = repoData.edges || [];
        for (const edge of edges) {
          repos.push(edge.node.name);
        }

        const pageInfo = repoData.pageInfo;
        if (!pageInfo?.hasNextPage) {
          break;
        }

        after = pageInfo.endCursor;
        await this.sleep(200);
      } catch (error) {
        this.logger.error("Failed to fetch repositories", error);
        break;
      }
    }

    return repos;
  }

  private async fetchAllCommits(
    token: string,
    repoName: string,
    sinceDate?: string
  ): Promise<RawCommitRecord[]> {
    const commits: RawCommitRecord[] = [];
    let after: string | null = null;
    let pageCount = 0;
    const MAX_PAGES = 100; // Increased for backfill

    while (after !== null && pageCount < MAX_PAGES) {
      try {
        const response = await this.withRetry(async () => {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "User-Agent": "data-sync-app",
          };

          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const variables: Record<string, any> = {
            owner: this.owner,
            name: repoName,
            after,
          };

          // Add date filter if provided
          if (sinceDate) {
            variables.since = sinceDate;
          }

          const res = await fetch(GITHUB_GRAPHQL_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: REPO_COMMIT_QUERY,
              variables,
            }),
          });

          if (!res.ok) {
            throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
          }

          return res.json();
        });

        const history =
          response.data?.repository?.defaultBranchRef?.target?.history;
        const edges = history?.edges || [];

        if (edges.length === 0) {
          break;
        }

        for (const edge of edges) {
          const node = edge.node;
          const coAuthors = node.coAuthors?.edges || [];
          const hasCoAuthor = coAuthors.length > 0;
          const isAI = isAIAuthor(node.author.email, node.message, hasCoAuthor);

          commits.push({
            date: node.committedDate.substring(0, 10),
            repo: repoName,
            owner: this.owner,
            sha: node.sha,
            message: node.message,
            author_email: node.author.email,
            author_name: node.author.name,
            additions: node.additions || 0,
            deletions: node.deletions || 0,
            changed_files: node.changedFiles || 0,
            co_authors: coAuthors.map((e: any) => e.node.email),
            has_co_author: hasCoAuthor ? 1 : 0,
            is_ai: isAI ? 1 : 0,
            committed_at: node.committedDate,
          });
        }

        const pageInfo = history?.pageInfo;
        after = pageInfo?.hasNextPage ? pageInfo.endCursor : null;
        pageCount++;

        // Small delay between pages
        await this.sleep(100);
      } catch (error) {
        this.logger.warn(`Failed to fetch page ${pageCount + 1} for ${repoName}`, error);
        break;
      }
    }

    return commits;
  }

  protected async transform(data: RawCommitRecord[]): Promise<RawCommitRecord[]> {
    // Raw data doesn't need transformation
    return data;
  }

  protected async insert(
    client: ClickHouseClient,
    records: RawCommitRecord[]
  ): Promise<number> {
    if (records.length === 0) {
      return 0;
    }

    this.logger.info(`Inserting ${records.length} raw commits into ClickHouse`);

    // Batch insert for better performance
    const batchSize = 1000;
    let inserted = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const values = batch
        .map(
          (r) =>
            `('${r.date}', '${r.repo}', '${r.owner}', '${r.sha}', ` +
            `${this.escapeString(r.message)}, '${r.author_email}', ` +
            `${this.escapeString(r.author_name)}, ${r.additions}, ${r.deletions}, ` +
            `${r.changed_files}, [${r.co_authors.map((e) => `'${e}'`).join(',')}], ` +
            `${r.has_co_author}, ${r.is_ai}, '${r.committed_at}')`
        )
        .join(",\n");

      const query = `
        INSERT INTO ${this.getTableName()} (
          date, repo, owner, sha, message, author_email, author_name,
          additions, deletions, changed_files, co_authors, has_co_author,
          is_ai, committed_at
        ) VALUES
        ${values}
      `;

      try {
        await client.insert({
          table: this.getTableName(),
          values: batch,
          format: "JSON",
        });
        inserted += batch.length;
        this.logger.debug(`Inserted batch ${i / batchSize + 1}/${Math.ceil(records.length / batchSize)}`);
      } catch (error) {
        this.logger.error(`Failed to insert batch`, error);
      }
    }

    this.logger.info(`Inserted ${inserted}/${records.length} raw commits`);
    return inserted;
  }

  private escapeString(str: string): string {
    return str.replace(/'/g, "\\'").replace(/\\/g, "\\\\");
  }
}
