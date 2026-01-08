import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface GitHubCommit {
  sha: string;
  message: string;
  author_email: string;
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

interface AICodePercentageRecord {
  date: string;
  username: string;
  total_commits: number;
  human_commits: number;
  ai_commits: number;
  total_lines_added: number;
  human_lines_added: number;
  ai_lines_added: number;
  ai_percentage: number;
  repo_count: number;
}

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const REPO_COMMIT_QUERY = `
  query($owner: String!, $name: String!, $after: String) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 100, after: $after) {
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
}
`;

function isAIAuthor(email: string, message: string, hasCoAuthor: boolean): boolean {
  if (hasCoAuthor) {
    return true;
  }

  if (email.endsWith("@users.noreply.github.com")) {
    return true;
  }

  const lowerMessage = message.toLowerCase();
  if (
    lowerMessage.includes("[bot]") ||
    lowerMessage.includes("[auto]") ||
    lowerMessage.includes("[ci]")
  ) {
    return true;
  }

  return false;
}

export class AICodePercentageSyncer extends BaseSyncer<
  GitHubRepoCommitResponse,
  AICodePercentageRecord
> {
  private owner: string;

  constructor(client: ClickHouseClient, owner?: string) {
    super(client, "ai-code-percentage");
    this.owner = owner || process.env.GITHUB_USERNAME || "duyet";
  }

  protected getTableName(): string {
    return "monorepo_ai_code_percentage";
  }

  protected async fetchFromApi(
    _options: SyncOptions
  ): Promise<GitHubRepoCommitResponse[]> {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    this.logger.info(`Fetching AI code percentage data for user: ${this.owner}`);

    const repos = await this.fetchAllRepos(token);

    if (repos.length === 0) {
      this.logger.warn("No repositories found");
      return [];
    }

    this.logger.info(`Processing ${repos.length} repositories`);

    const allCommits: GitHubCommit[] = [];

    for (const repo of repos) {
      this.logger.info(`Fetching commits from ${repo}`);

      const commits = await this.fetchAllCommits(token, repo);
      allCommits.push(...commits);

      this.logger.debug(`Fetched ${commits.length} commits from ${repo}`);
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

    const reposQuery = `
      query($login: String!) {
        user(login: $login) {
          repositories(first: 100, ownerAffiliations: OWNER) {
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
            variables: { login: this.owner },
          }),
        });

        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        }

        return res.json();
      });

      const repoNodes = response.data?.user?.repositories?.edges || [];

      for (const edge of repoNodes) {
        repos.push(edge.node.name);
      }
    } catch (error) {
      this.logger.error("Failed to fetch repositories", error);
    }

    return repos;
  }

  private async fetchAllCommits(
    token: string,
    repoName: string
  ): Promise<GitHubCommit[]> {
    const commits: GitHubCommit[] = [];
    let after: string | null = null;
    let pageCount = 0;
    const MAX_PAGES = 10;

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
            },
          }),
        });

        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        }

        return res.json();
      });

      const edges =
        response.data?.repository?.defaultBranchRef?.target?.history?.edges || [];

      for (const edge of edges) {
        const node = edge.node;
        commits.push({
          sha: node.sha,
          message: node.message,
          author_email: node.author.email,
          additions: node.additions,
          deletions: node.deletions,
          changed_files: node.changedFiles,
          committed_date: node.committedDate,
          co_authors: node.coAuthors.edges.map((e) => ({
            name: e.node.name,
            email: e.node.email,
          })),
        });
      }

      const pageInfo =
        response.data?.repository?.defaultBranchRef?.target?.history?.pageInfo;

      after = pageInfo?.hasNextPage ? pageInfo.endCursor : null;
      pageCount++;

      await this.sleep(200);
    }

    return commits;
  }

  protected async transform(
    data: GitHubRepoCommitResponse[]
  ): Promise<AICodePercentageRecord[]> {
    if (!data || data.length === 0) {
      return [];
    }

    const edges =
      data[0].data?.repository?.defaultBranchRef?.target?.history?.edges || [];

    if (edges.length === 0) {
      return [];
    }

    const dailyData = new Map<string, AICodePercentageRecord>();
    const processedRepos = new Set<string>();

    for (const edge of edges) {
      const commit = edge.node;
      const date = commit.committedDate.substring(0, 10);

      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          username: this.owner,
          total_commits: 0,
          human_commits: 0,
          ai_commits: 0,
          total_lines_added: 0,
          human_lines_added: 0,
          ai_lines_added: 0,
          ai_percentage: 0,
          repo_count: 0,
        });
      }

      const record = dailyData.get(date)!;
      record.total_commits++;
      record.total_lines_added += commit.additions;

      const hasCoAuthor = commit.coAuthors.length > 0;
      const isAI = isAIAuthor(
        commit.author.email,
        commit.message,
        hasCoAuthor
      );

      if (isAI) {
        record.ai_commits++;
        record.ai_lines_added += commit.additions;
      } else {
        record.human_commits++;
        record.human_lines_added += commit.additions;
      }

      processedRepos.add(this.owner);
    }

    const records = Array.from(dailyData.values());

    for (const record of records) {
      record.repo_count = processedRepos.size;

      if (record.total_lines_added > 0) {
        record.ai_percentage =
          (record.ai_lines_added / record.total_lines_added) * 100;
      }
    }

    this.logger.info(
      `Transformed ${records.length} daily records from ${edges.length} commits`
    );

    return records;
  }
}
