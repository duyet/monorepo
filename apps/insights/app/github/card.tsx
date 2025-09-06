import { StaticCard } from '../../components/StaticCard'

// See: https://github.com/anuraghazra/github-readme-stats
const githubStatUrl = (params: { username: string; theme: string }): string => {
  const { username, theme } = params

  const urlParams = new URLSearchParams({
    username,
    theme,
    custom_title: `@duyet's github stats`,
    hide_border: 'true',
    show_icons: 'true',
    include_all_commits: 'true',
    count_private: 'true',
    text_bold: 'false',
  })

  return `https://github-readme-stats.vercel.app/api?${urlParams.toString()}`
}

export function GithubCard({ owner }: { owner: string }) {
  return (
    <StaticCard
      className="dark:border-0 dark:p-0"
      source="Github"
      url={{
        light: githubStatUrl({ username: owner, theme: 'default' }),
        dark: githubStatUrl({ username: owner, theme: 'dracula' }),
      }}
    />
  )
}
