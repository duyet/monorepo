import { StaticCard } from '../../components/static-card';

// See: https://github.com/anuraghazra/github-readme-stats
const githubStatUrl = (params: { theme: string }): string => {
  const urlParams = new URLSearchParams({
    username: 'duyet',
    custom_title: `@duyet's github stats`,
    hide_border: 'true',
    show_icons: 'true',
    include_all_commits: 'true',
    count_private: 'true',
    text_bold: 'false',
    ...params,
  });

  return `https://github-readme-stats.vercel.app/api?${urlParams.toString()}`;
};

export default async function Github() {
  return (
    <div className="mt-10 space-y-6">
      <StaticCard
        className="dark:border-0 dark:p-0"
        source="Github"
        url={{
          light: githubStatUrl({ theme: 'default' }),
          dark: githubStatUrl({ theme: 'dracula' }),
        }}
      />
    </div>
  );
}
