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

export async function fetchAllRepositories(owner: string): Promise<GitHubRepository[]> {
  const allRepos: GitHubRepository[] = []
  let page = 1
  const perPage = 100
  
  while (true) {
    try {
      console.log(`Fetching repositories page ${page} for ${owner}`)
      
      const response = await fetch(
        `https://api.github.com/search/repositories?q=user:${owner}+is:public&sort=updated&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
          cache: 'force-cache',
        }
      )

      if (!response.ok) {
        console.error(`Failed to fetch repositories page ${page}:`, response.statusText)
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
      
      // GitHub Search API has a limit of 1000 results (10 pages of 100)
      // But let's add a safety limit to prevent infinite loops
      if (page > 20) {
        console.warn(`Reached page limit (${page}), stopping pagination`)
        break
      }
      
    } catch (error) {
      console.error(`Error fetching repositories page ${page}:`, error)
      break
    }
  }
  
  console.log(`Total repositories fetched: ${allRepos.length}`)
  return allRepos
}