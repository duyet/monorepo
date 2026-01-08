import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface GitHubCommit {
  repo: string;
  repo_url: string;
  sha: string;
  short_sha: string;
  commit_url: string;
  web_url: string;
  author_name: string;
  author_email: string;
  author_date: string;
  committer_name: string;
  committer_email: string;
  committer_date: string;
  message: string;
  message_headline: string;
  message_body: string;
  additions: number;
  deletions: number;
  changed_files: number;
  parents: string[];
  co_authors: Array<{
    name: string;
    email: string;
  }>;
  signature_exists: boolean;
  signature_valid: boolean;
  signature_method: string | null;
  committed_date: string;
  authored_date: string;
  pushed_date: string | null;
}

interface RawCommitRecord {
  date: string;
  repo: string;
  repo_owner: string;
  repo_url: string;
  sha: string;
  short_sha: string;
  commit_url: string;
  web_url: string;
  author_name: string;
  author_email: string;
  author_date: string;
  committer_name: string;
  committer_email: string;
  committer_date: string;
  message: string;
  message_headline: string;
  message_body: string;
  additions: number;
  deletions: number;
  changed_files: number;
  parents: string[];
  co_authors: string[]; // Stored as array of "name <email>" strings
  signature_exists: number;
  signature_valid: number;
  signature_method: string;
  committed_at: string;
  authored_at: string;
  pushed_date: string | null;
}

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const REPO_COMMIT_QUERY = `
  query($owner: String!, $name: String!, $after: String, $since: GitTimestamp) {
    repository(owner: $owner, name: $name) {
      url
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
                  abbreviatedOid
                  url
                  message
                  messageHeadline
                  messageBody
                  author {
                    name
                    email
                    date
                  }
                  committer {
                    name
                    email
                    date
                  }
                  signature {
                    exists
                    valid
                    method
                  }
                  additions
                  deletions
                  changedFiles
                  pushedDate
                  committedDate
                  authoredDate
                  parents(first: 10) {
                    edges {
                      node {
                        oid
                      }
                    }
                  }
                  coAuthors(first: 10) {
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
  any,
  RawCommitRecord[]
> {
  private owners: string[];
  private owner: string = '';

  constructor(client: ClickHouseClient, owner?: string | string[]) {
    super(client, "ai-code-percentage");

    if (owner) {
      this.owners = Array.isArray(owner) ? owner : [owner];
    } else {
      // Support multiple owners from environment variable (comma-separated)
      const ownersEnv = process.env.GITHUB_USERNAMES || process.env.GITHUB_USERNAME || "duyet";
      this.owners = ownersEnv.split(',').map(o => o.trim());
    }
  }

  protected getTableName(): string {
    return "github_commits_raw";
  }

  protected async fetchFromApi(
    options: SyncOptions
  ): Promise<any[]> {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    // Calculate since date if startDate is provided
    const since = options.startDate
      ? options.startDate.toISOString()
      : undefined;

    this.logger.info(
      `Fetching commits for ${this.owners.length} users: ${this.owners.join(', ')}` +
        (since ? ` since ${since}` : "")
    );

    // Fetch repos and commits for all owners
    const allCommits: Array<GitHubCommit & { repo: string; repo_owner: string }> = [];

    for (const currentOwner of this.owners) {
      this.logger.info(`Fetching repositories for ${currentOwner}...`);

      const repos = await this.fetchAllRepos(token, currentOwner);

      if (repos.length === 0) {
        this.logger.warn(`No repositories found for ${currentOwner}`);
        continue;
      }

      this.logger.info(`Processing ${repos.length} repositories for ${currentOwner}`);

      // Process repos in batches to avoid overwhelming the API
      const batchSize = 10;
      const commitsByRepo: Map<string, GitHubCommit[]> = new Map();

      for (let i = 0; i < repos.length; i += batchSize) {
        const batch = repos.slice(i, i + batchSize);
        this.logger.info(
          `Fetching commits from batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(repos.length / batchSize)} for ${currentOwner}`
        );

        for (const repo of batch) {
          const commits = await this.fetchAllCommits(token, repo, since, currentOwner);
          commitsByRepo.set(repo, commits);

          if (commits.length > 0) {
            this.logger.debug(
              `Fetched ${commits.length} commits from ${currentOwner}/${repo}`
            );
          }
        }

        // Rate limit delay between batches
        if (i + batchSize < repos.length) {
          await this.sleep(2000);
        }
      }

      // Flatten commits with repo names and owner
      for (const [repo, commits] of commitsByRepo.entries()) {
        allCommits.push(...commits.map(c => ({ ...c, repo, repo_owner: currentOwner })));
      }
    }

    this.logger.info(`Total commits fetched: ${allCommits.length}`);

    if (allCommits.length === 0) {
      return [];
    }

    // Group by owner to create separate responses
    const commitsByOwner = new Map<string, Array<typeof allCommits[0]>>();
    for (const commit of allCommits) {
      if (!commitsByOwner.has(commit.repo_owner)) {
        commitsByOwner.set(commit.repo_owner, []);
      }
      commitsByOwner.get(commit.repo_owner)!.push(commit);
    }

    // Create separate response for each owner
    const responses: any[] = [];
    for (const [currentOwner, commits] of commitsByOwner) {
      responses.push({
        data: {
          repository: {
            url: `https://github.com/${currentOwner}`,
            defaultBranchRef: {
              target: {
                history: {
                  pageInfo: {
                    hasNextPage: false,
                    endCursor: "",
                  },
                  edges: commits.map((commit) => ({
                    // Include repo name as custom field
                    _repo: commit.repo,
                    node: {
                      oid: commit.sha,
                      abbreviatedOid: commit.short_sha,
                      url: commit.commit_url,
                      message: commit.message,
                      messageHeadline: commit.message_headline,
                      messageBody: commit.message_body || "",
                      author: {
                        name: commit.author_name,
                        email: commit.author_email,
                        date: commit.author_date,
                      },
                      committer: {
                        name: commit.committer_name,
                        email: commit.committer_email,
                        date: commit.committer_date,
                      },
                      signature: {
                        exists: commit.signature_exists,
                        valid: commit.signature_valid ? commit.signature_valid : null,
                        method: commit.signature_method,
                      },
                      additions: commit.additions,
                      deletions: commit.deletions,
                      changedFiles: commit.changed_files,
                      pushedDate: commit.pushed_date,
                      committedDate: commit.committed_date,
                      authoredDate: commit.authored_date,
                      parents: {
                        edges: commit.parents.map((oid) => ({
                          node: { oid },
                        })),
                      },
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
      });
    }

    return responses;
  }

  private async fetchAllRepos(token: string, owner: string): Promise<string[]> {
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
                url
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
              variables: { login: owner, after },
            }),
          });

          if (!res.ok) {
            throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
          }

          return res.json();
        });

        const repoNodes =
          response.data?.user?.repositories?.edges || [];

        for (const edge of repoNodes) {
          repos.push(edge.node.name);
        }

        const pageInfo = response.data?.user?.repositories?.pageInfo;
        after = pageInfo?.hasNextPage ? pageInfo.endCursor : null;

        if (after) {
          await this.sleep(1000);
        }
      } while (after);

      this.logger.info(`Found ${repos.length} repositories for ${owner}`);
    } catch (error) {
      this.logger.error("Failed to fetch repositories", error);
    }

    return repos;
  }

  private async fetchAllCommits(
    token: string,
    repoName: string,
    since?: string,
    owner?: string
  ): Promise<GitHubCommit[]> {
    const commits: GitHubCommit[] = [];
    let after: string | null = null;
    let pageCount = 0;
    const MAX_PAGES = 100; // Increased for backfill
    const currentOwner = owner || this.owners[0];

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
              owner: currentOwner,
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

      const repoUrl = response.data?.repository?.url || `https://github.com/${currentOwner}/${repoName}`;

      for (const edge of edges) {
        const node = edge.node;
        commits.push({
          repo: repoName,
          repo_url: repoUrl,
          sha: node.oid,
          short_sha: node.abbreviatedOid,
          commit_url: node.url,
          web_url: `${repoUrl}/commit/${node.abbreviatedOid}`,
          message: node.message,
          message_headline: node.messageHeadline,
          message_body: node.messageBody || "",
          author_name: node.author.name,
          author_email: node.author.email,
          author_date: node.author.date,
          committer_name: node.committer.name,
          committer_email: node.committer.email,
          committer_date: node.committer.date,
          additions: node.additions,
          deletions: node.deletions,
          changed_files: node.changedFiles,
          parents: node.parents.edges.map((e: any) => e.node.oid),
          co_authors: node.coAuthors.edges.map((e: any) => ({
            name: e.node.name,
            email: e.node.email,
          })),
          signature_exists: node.signature?.exists || false,
          signature_valid: node.signature?.valid || false,
          signature_method: node.signature?.method || null,
          committed_date: node.committedDate,
          authored_date: node.authoredDate,
          pushed_date: node.pushedDate,
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
    data: any[]
  ): Promise<RawCommitRecord[]> {
    if (!data || data.length === 0) {
      return [];
    }

    const records: RawCommitRecord[] = [];

    // Process all responses (one per owner)
    for (const response of data) {
      const edges =
        response.data?.repository?.defaultBranchRef?.target?.history?.edges || [];

      const repoUrl = response.data?.repository?.url || '';
      // Extract repo_owner from URL (e.g., "https://github.com/duyet" -> "duyet")
      const repoOwner = repoUrl.split('github.com/')[1] || this.owners[0];

      for (const edge of edges) {
        const commit = edge.node;

        // Format co_authors as array of "name <email>" strings
        const coAuthorsFormatted = commit.coAuthors.edges.map((e: any) => {
          const name = e.node.name;
          const email = e.node.email;
          return `${name} <${email}>`;
        });

        records.push({
          date: new Date(commit.committedDate).toISOString().split('T')[0],
          repo: edge._repo || "unknown", // Use repo name from edge
          repo_owner: repoOwner,
          repo_url: repoUrl,
          sha: commit.oid,
          short_sha: commit.abbreviatedOid,
          commit_url: commit.url,
          web_url: `${repoUrl}/commit/${commit.abbreviatedOid}`,
          author_name: commit.author.name,
          author_email: commit.author.email,
          author_date: commit.author.date,
          committer_name: commit.committer.name,
          committer_email: commit.committer.email,
          committer_date: commit.committer.date,
          message: commit.message,
          message_headline: commit.messageHeadline,
          message_body: commit.messageBody || "",
          additions: commit.additions,
          deletions: commit.deletions,
          changed_files: commit.changedFiles,
          parents: commit.parents.edges.map((e: any) => e.node.oid),
          co_authors: coAuthorsFormatted,
          signature_exists: commit.signature?.exists ? 1 : 0,
          signature_valid: commit.signature?.valid ? 1 : 0,
          signature_method: commit.signature?.method || "",
          committed_at: commit.committedDate,
          authored_at: commit.authoredDate,
          pushed_date: commit.pushedDate || null,
        });
      }
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
