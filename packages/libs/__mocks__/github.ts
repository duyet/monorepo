/**
 * Mock for GitHub API client
 * Used for testing GitHub data fetching in insights app
 */

export interface MockGitHubUser {
  login: string;
  id: number;
  name: string;
  email: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

export interface MockGitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  created_at: string;
}

export interface MockGitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export interface MockGitHubContribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

class MockGitHubClient {
  private users: Map<string, MockGitHubUser> = new Map();
  private repos: Map<string, MockGitHubRepo[]> = new Map();
  private commits: Map<string, MockGitHubCommit[]> = new Map();
  private contributions: Map<string, MockGitHubContribution[]> = new Map();

  async getUser(username: string): Promise<MockGitHubUser | null> {
    return this.users.get(username) || null;
  }

  async getRepos(username: string): Promise<MockGitHubRepo[]> {
    return this.repos.get(username) || [];
  }

  async getCommits(owner: string, repo: string): Promise<MockGitHubCommit[]> {
    const key = `${owner}/${repo}`;
    return this.commits.get(key) || [];
  }

  async getContributions(username: string): Promise<MockGitHubContribution[]> {
    return this.contributions.get(username) || [];
  }

  async searchRepos(query: string): Promise<MockGitHubRepo[]> {
    const allRepos: MockGitHubRepo[] = [];
    for (const repos of this.repos.values()) {
      allRepos.push(...repos);
    }
    return allRepos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query.toLowerCase()) ||
        repo.description?.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Test helper methods
  _setUser(username: string, user: MockGitHubUser): void {
    this.users.set(username, user);
  }

  _setRepos(username: string, repos: MockGitHubRepo[]): void {
    this.repos.set(username, repos);
  }

  _setCommits(owner: string, repo: string, commits: MockGitHubCommit[]): void {
    const key = `${owner}/${repo}`;
    this.commits.set(key, commits);
  }

  _setContributions(
    username: string,
    contributions: MockGitHubContribution[]
  ): void {
    this.contributions.set(username, contributions);
  }

  _clear(): void {
    this.users.clear();
    this.repos.clear();
    this.commits.clear();
    this.contributions.clear();
  }
}

export const createMockGitHubClient = (): MockGitHubClient =>
  new MockGitHubClient();

// Default export for jest.mock()
export default createMockGitHubClient();

// Mock fetch for GitHub API calls
export const mockGitHubFetch = (responses: Record<string, any>) => {
  global.fetch = jest.fn((url: string | URL | Request) => {
    const urlString = typeof url === "string" ? url : url.toString();
    const matchingKey = Object.keys(responses).find((key) =>
      urlString.includes(key)
    );

    if (matchingKey) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => responses[matchingKey],
        text: async () => JSON.stringify(responses[matchingKey]),
      } as Response);
    }

    return Promise.resolve({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not found" }),
      text: async () => JSON.stringify({ message: "Not found" }),
    } as Response);
  }) as jest.Mock;
};
