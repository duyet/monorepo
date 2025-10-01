import { GithubActivity } from './activity'
import { GithubCard } from './card'
import { CommitTimeline } from './commit-timeline'
import { GitHubLanguageStats } from './language-stats'
import { RepoTrends } from './repo-trends'
import { Repos } from './repos'
import { PageLayout, SectionLayout } from '@/components/layouts'

const owner = 'duyet'

export const metadata = {
  title: 'GitHub Insights @duyet',
  description: 'GitHub repository analytics and development activity insights',
}

// Static generation only
export const dynamic = 'force-static'

export default function Page() {
  return (
    <PageLayout
      title="GitHub Analytics"
      description="Repository insights and development activity"
    >
      <SectionLayout
        title="Language Distribution"
        description="Programming languages and repository statistics"
      >
        <GitHubLanguageStats />
      </SectionLayout>

      <SectionLayout
        title="Repository Trends"
        description="Stars, forks, and trending repositories"
      >
        <RepoTrends />
      </SectionLayout>

      <SectionLayout
        title="Repository Overview"
        description="Public repositories and statistics"
      >
        <Repos owner={owner} />
      </SectionLayout>

      <SectionLayout
        title="Commit Activity"
        description="Weekly commit frequency and patterns"
      >
        <CommitTimeline />
      </SectionLayout>

      <SectionLayout
        title="Development Activity"
        description="Recent contributions and activity patterns"
      >
        <GithubActivity owner={owner} />
      </SectionLayout>

      <SectionLayout
        title="Profile Statistics"
        description="Overall GitHub profile metrics"
      >
        <GithubCard owner={owner} />
      </SectionLayout>
    </PageLayout>
  )
}
