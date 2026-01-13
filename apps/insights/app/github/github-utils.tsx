import { calculateBackoffDelay, githubConfig } from "@duyet/config";

export interface GitHubRepository {
  name: string;
  stargazers_count?: number;
  forks_count?: number;
  watchers_count?: number;
  updated_at: string;
  language?: string;
  size?: number;
  archived?: boolean;
  private?: boolean;
}

/**
 * Get GitHub token from environment variables
 * @returns {string | null} GitHub token or null if not configured
 */
export function getGithubToken(): string | null {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn(
      "GITHUB_TOKEN environment variable is not configured. GitHub API calls will fail."
    );
    return null;
  }
  return token;
}

export async function fetchAllRepositories(
  owner: string
): Promise<GitHubRepository[]> {
  // Check if GitHub token is configured
  const token = getGithubToken();
  if (!token) {
    console.warn("GITHUB_TOKEN not configured, returning empty repositories");
    return [];
  }

  const allRepos: GitHubRepository[] = [];
  let page = 1;
  const { perPage, maxPages } = githubConfig.pagination;
  let retryCount = 0;
  const { maxRetries } = githubConfig.retry;

  while (page <= maxPages) {
    try {
      console.log(`Fetching repositories page ${page} for ${owner}`);

      const response = await fetch(
        `${githubConfig.baseUrl}${githubConfig.endpoints.searchRepositories}?q=user:${owner}+is:public&sort=updated&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: githubConfig.headers.accept,
            "User-Agent": githubConfig.headers.userAgent,
          },
          next: { revalidate: githubConfig.cache.revalidate },
        }
      );

      // Handle rate limiting
      if (githubConfig.rateLimit.retryStatuses.includes(response.status)) {
        const retryAfter = response.headers.get("retry-after");

        if (retryCount < maxRetries) {
          const waitTime = retryAfter
            ? Number.parseInt(retryAfter, 10) * 1000
            : calculateBackoffDelay(retryCount, githubConfig.retry);

          console.warn(
            `Rate limited on page ${page}. Retrying in ${waitTime}ms (attempt ${retryCount + 1}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }
        console.error(
          `Rate limit exceeded after ${maxRetries} retries. Stopping.`
        );
        break;
      }

      if (!response.ok) {
        if (response.status === 401) {
          console.error("GitHub API authentication failed - invalid token");
        } else {
          console.error(
            `Failed to fetch repositories page ${page}: ${response.status} ${response.statusText}`
          );
        }
        break;
      }

      const data = await response.json();

      // Handle case where API response doesn't include items (e.g., authentication error)
      if (!data || !Array.isArray(data.items)) {
        console.error(
          `Invalid response format from GitHub API on page ${page}`
        );
        break;
      }

      const repos = data.items || [];

      if (repos.length === 0) {
        break; // No more repositories
      }

      allRepos.push(...repos);

      // If we got less than perPage items, we've reached the end
      if (repos.length < perPage) {
        break;
      }

      page++;
      retryCount = 0; // Reset retry count on successful request
    } catch (error) {
      console.error(`Error fetching repositories page ${page}:`, error);

      if (retryCount < maxRetries) {
        const waitTime = calculateBackoffDelay(retryCount, githubConfig.retry);
        console.warn(
          `Retrying page ${page} in ${waitTime}ms (attempt ${retryCount + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        retryCount++;
      } else {
        console.error(
          `Failed to fetch page ${page} after ${maxRetries} retries. Stopping.`
        );
        break;
      }
    }
  }

  console.log(`Total repositories fetched: ${allRepos.length}`);
  return allRepos;
}
