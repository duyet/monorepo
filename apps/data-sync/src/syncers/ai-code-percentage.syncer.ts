import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface GitHubCommit {
  repo: string;
  sha: string;
  message: string;
  author_email: string;
  author_name: string;
  additions: number;
  deletions: number;
  changed_files: number;
  committed_date: string;
  co_authors: Array<{
    name: string;
    email: string;
  }>;
}

interface GitHubRepoCommitResponse {
  data: {
    repository: {
      defaultBranchRef: {
        target: {
          history: {
            pageInfo: {
              hasNextPage: boolean;
              endCursor: string;
            };
            edges: Array<{
              node: {
                sha: string;
                message: string;
                author: {
                  email: string;
                  name: string;
                  date: string;
                };
                additions: number;
                deletions: number;
                changedFiles: number;
                committedDate: string;
                coAuthors: {
                  edges: Array<{
                    node: {
                      name: string;
                      email: string;
                    };
                  }>;
                };
              };
            }>;
          };
        };
      };
    };
  };
}

interface RawCommitRecord {
  repo: string;
  repo_owner: string;
  sha: string;
  message: string;
  author_email: string;
  author_name: string;
  additions: number;
  deletions: number;
  changed_files: number;
  co_authors: string[];
  committed_at: string;
}

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

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
                  sha: oid
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

export class AICodePercentageSyncer extends BaseSyncer<
  GitHubRepoCommitResponse,
  RawCommitRecord[]
> {
  private owner: string;

  constructor(client: ClickHouseClient, owner?: string) {
    super(client, "ai-code-percentage");
    this.owner = owner || process.env.GITHUB_USERNAME || "duyet";
  }

  protected getTableName(): string {
    return "github_commits_raw";
  }

  protected async fetchFromApi(
    options: SyncOptions
  ): Promise<GitHubRepoCommitResponse[]> {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    // Calculate since date if startDate is provided
    const since = options.startDate
      ? options.startDate.toISOString()
      : undefined;

    this.logger.info(
      `Fetching commits for user: ${this.owner}${since ? ` since ${since}` : ""}`
    );

    const repos = await this.fetchAllRepos(token);

    if (repos.length === 0) {
      this.logger.warn("No repositories found");
      return [];
    }

    this.logger.info(`Processing ${repos.length} repositories`);

    // Process repos in batches to avoid overwhelming the API
    const batchSize = 10;
    const commitsByRepo: Map<string, GitHubCommit[]> = new Map();

    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);
      this.logger.info(
        `Fetching commits from batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(repos.length / batchSize)}`
      );

      for (const repo of batch) {
        const commits = await this.fetchAllCommits(token, repo, since);
        commitsByRepo.set(repo, commits);

        if (commits.length > 0) {
          this.logger.debug(`Fetched ${commits.length} commits from ${repo}`);
        }
      }

      // Rate limit delay between batches
      if (i + batchSize < repos.length) {
        await this.sleep(2000);
      }
    }

    // Flatten commits with repo names
    const allCommits: Array<GitHubCommit & { repo: string }> = [];
    for (const [repo, commits] of commitsByRepo.entries()) {
      allCommits.push(...commits.map((c) => ({ ...c, repo })));
    }

    this.logger.info(`Total commits fetched: ${allCommits.length}`);

    return [
      {
        data: {
          repository: {
            defaultBranchRef: {
              target: {
                history: {
                  pageInfo: {
                    hasNextPage: false,
                    endCursor: "",
                  },
                  edges: allCommits.map((commit) => ({
                    node: {
                      sha: commit.sha,
                      message: commit.message,
                      author: {
                        email: commit.author_email,
                        name: commit.author_name,
                        date: commit.committed_date,
                      },
                      additions: commit.additions,
                      deletions: commit.deletions,
                      changedFiles: commit.changed_files,
                      committedDate: commit.committed_date,
                      coAuthors: {
                        edges: commit.co_authors.map((author) => ({
                          node: {
                            name: author.name,
                            email: author.email,
                          },
                        })),
                      },
                    },
                  })),
                },
              },
            },
          },
        },
      },
    ];
  }

  private async fetchAllRepos(token: string): Promise<string[]> {
    const repos: string[] = [];
    let after: string | null = null;

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
      do {
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
            throw new Error(
              `GitHub API error: ${res.status} ${res.statusText}`
            );
          }

          return res.json();
        });

        const repoNodes = response.data?.user?.repositories?.edges || [];

        for (const edge of repoNodes) {
          repos.push(edge.node.name);
        }

        const pageInfo = response.data?.user?.repositories?.pageInfo;
        after = pageInfo?.hasNextPage ? pageInfo.endCursor : null;

        if (after) {
          await this.sleep(1000);
        }
      } while (after);

      this.logger.info(`Found ${repos.length} repositories`);
    } catch (error) {
      this.logger.error("Failed to fetch repositories", error);
    }

    return repos;
  }

  private async fetchAllCommits(
    token: string,
    repoName: string,
    since?: string
  ): Promise<GitHubCommit[]> {
    const commits: GitHubCommit[] = [];
    let after: string | null = null;
    let pageCount = 0;
    const MAX_PAGES = 100; // Increased for backfill

    while (after !== null && pageCount < MAX_PAGES) {
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
            query: REPO_COMMIT_QUERY,
            variables: {
              owner: this.owner,
              name: repoName,
              after,
              since,
            },
          }),
        });

        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        }

        return res.json();
      });

      const edges =
        response.data?.repository?.defaultBranchRef?.target?.history?.edges ||
        [];

      if (edges.length === 0) {
        break;
      }

      for (const edge of edges) {
        const node = edge.node;
        commits.push({
          sha: node.sha,
          message: node.message,
          author_email: node.author.email,
          author_name: node.author.name,
          additions: node.additions,
          deletions: node.deletions,
          changed_files: node.changedFiles,
          committed_date: node.committedDate,
          co_authors: node.coAuthors.edges.map((e: any) => ({
            name: e.node.name,
            email: e.node.email,
          })),
        });
      }

      const pageInfo =
        response.data?.repository?.defaultBranchRef?.target?.history?.pageInfo;

      after = pageInfo?.hasNextPage ? pageInfo.endCursor : null;
      pageCount++;

      // Rate limit delay
      await this.sleep(200);
    }

    return commits;
  }

  protected async transform(
    data: GitHubRepoCommitResponse[]
  ): Promise<RawCommitRecord[]> {
    if (!data || data.length === 0) {
      return [];
    }

    const edges =
      data[0].data?.repository?.defaultBranchRef?.target?.history?.edges || [];

    if (edges.length === 0) {
      return [];
    }

    const records: RawCommitRecord[] = [];

    for (const edge of edges) {
      const commit = edge.node;

      records.push({
        repo: commit.repo,
        repo_owner: this.owner,
        sha: commit.sha,
        message: commit.message,
        author_email: commit.author_email,
        author_name: commit.author_name,
        additions: commit.additions,
        deletions: commit.deletions,
        changed_files: commit.changed_files,
        co_authors: commit.co_authors.map((c: any) => c.email),
        committed_at: commit.committed_date,
      });
    }

    this.logger.info(`Transformed ${records.length} commit records`);

    return records;
  }

  protected async getBatchRecords(
    records: RawCommitRecord[],
    _options: SyncOptions
  ): Promise<RawCommitRecord[][]> {
    // Split into batches of 1000 records for efficient insertion
    const batchSize = 1000;
    const batches: RawCommitRecord[][] = [];

    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    return batches;
  }
}
