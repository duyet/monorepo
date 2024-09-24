/* eslint-disable camelcase -- because want to keep original variable name from github api */

import type { GithubRepo } from '@duyet/interfaces'
import { cn } from '@duyet/libs/utils'
import { CodeIcon, StarIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

interface RepoProps {
  owner: string
  className?: string
}

export async function Repos({ owner, className }: RepoProps) {
  const repos = await getGithubRepos(
    owner,
    ['clickhouse-monitoring', 'pricetrack', 'grant-rs', 'charts'],
    [
      'awesome-web-scraper',
      'vietnamese-wordlist',
      'vietnamese-namedb',
      'vietnamese-frontend-interview-questions',
      'opencv-car-detection',
      'saveto',
      'firebase-shorten-url',
      'google-search-crawler',
    ],
    12,
  )

  return (
    <div className={cn('w-full', className)}>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo: GithubRepo) => (
          <Repo key={repo.name} repo={repo} />
        ))}
      </div>
    </div>
  )
}

function Repo({
  repo: { name, html_url, description, stargazers_count, language },
}: {
  repo: GithubRepo
}) {
  return (
    <div className="group relative rounded-lg border bg-background p-4 transition-all hover:shadow-lg">
      <Link className="absolute inset-0 z-10" href={html_url} prefetch={false}>
        <span className="sr-only">View project</span>
      </Link>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <StarIcon className="h-4 w-4" />
            <span>{stargazers_count}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {description || 'No description'}
        </p>

        <div className="flex flex-row">
          {language ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CodeIcon className="h-4 w-4" />
              <span>{language}</span>
            </div>
          ) : (
            <div />
          )}

          <div />
        </div>
      </div>
    </div>
  )
}

/**
 * Get Github projects of a user with some preferred projects and ignored projects
 */
async function getGithubRepos(
  owner: string,
  preferredProjects: string[] = [],
  ignoredProjects: string[] = [],
  n = 8,
): Promise<GithubRepo[]> {
  let repos: GithubRepo[] = []

  const fetchPage = async (page: number) => {
    const params = new URLSearchParams({
      q: `user:${owner}`,
      sort: 'stars',
      per_page: '100',
      type: 'all',
      page: page.toString(),
    })

    const headers = new Headers({
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    })

    const res = await fetch(
      `https://api.github.com/search/repositories?${params.toString()}`,
      { cache: 'force-cache', headers },
    )

    return res.json() as Promise<{ items: GithubRepo[] }>
  }

  const results = await fetchPage(1)
  repos = results.items

  const filteredRepos = repos.filter(
    (repo: GithubRepo) =>
      repo.stargazers_count > 0 &&
      !repo.archived &&
      !repo.disabled &&
      !ignoredProjects.includes(repo.name),
  )

  const sortedRepos = [
    ...preferredProjects
      .map((name) => filteredRepos.find((p) => p.name === name))
      .filter(Boolean),
    ...filteredRepos.filter((p) => !preferredProjects.includes(p.name)),
  ]
    .filter((project): project is GithubRepo => project !== undefined)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)

  return sortedRepos.slice(0, n)
}
