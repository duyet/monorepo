export interface GitHubRepository {
  name: string
  stargazers_count?: number
  forks_count?: number
  watchers_count?: number
  updated_at: string
  language?: string
  size?: number
  archived?: boolean
  private?: boolean
}

export async function fetchAllRepositories(
  owner: string,
): Promise<GitHubRepository[]> {
  const allRepos: GitHubRepository[] = []
  let page = 1
  const perPage = 100
  let retryCount = 0
  const maxRetries = 3

  while (page <= 10) {
    // GitHub Search API limit: 1000 results max (10 pages of 100)
    try {
      console.log(`Fetching repositories page ${page} for ${owner}`)

      const response = await fetch(
        `https://api.github.com/search/repositories?q=user:${owner}+is:public&sort=updated&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
          next: { revalidate: 3600 }, // Cache for 1 hour instead of force-cache
        },
      )

      // Handle rate limiting
      if (response.status === 403 || response.status === 429) {
        const retryAfter = response.headers.get('retry-after')

        if (retryCount < maxRetries) {
          const waitTime = retryAfter
            ? parseInt(retryAfter) * 1000
            : Math.pow(2, retryCount) * 1000 // Exponential backoff: 1s, 2s, 4s

          console.warn(
            `Rate limited on page ${page}. Retrying in ${waitTime}ms (attempt ${retryCount + 1}/${maxRetries})`,
          )
          await new Promise((resolve) => setTimeout(resolve, waitTime))
          retryCount++
          continue
        } else {
          console.error(
            `Rate limit exceeded after ${maxRetries} retries. Stopping.`,
          )
          break
        }
      }

      if (!response.ok) {
        console.error(
          `Failed to fetch repositories page ${page}:`,
          response.status,
          response.statusText,
        )
        break
      }

      const data = await response.json()
      const repos = data.items || []

      if (repos.length === 0) {
        break // No more repositories
      }

      allRepos.push(...repos)

      // If we got less than perPage items, we've reached the end
      if (repos.length < perPage) {
        break
      }

      page++
      retryCount = 0 // Reset retry count on successful request
    } catch (error) {
      console.error(`Error fetching repositories page ${page}:`, error)

      if (retryCount < maxRetries) {
        const waitTime = Math.pow(2, retryCount) * 1000 // Exponential backoff
        console.warn(
          `Retrying page ${page} in ${waitTime}ms (attempt ${retryCount + 1}/${maxRetries})`,
        )
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        retryCount++
        continue
      } else {
        console.error(
          `Failed to fetch page ${page} after ${maxRetries} retries. Stopping.`,
        )
        break
      }
    }
  }

  console.log(`Total repositories fetched: ${allRepos.length}`)
  return allRepos
}
