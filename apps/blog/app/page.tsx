import Link from 'next/link'

import Container from '@duyet/components/Container'
import Header from '@duyet/components/Header'
import { getPostsByAllYear } from '@duyet/libs/getPost'
import { YearPost } from '../components/year-post'
import {
  FeatureCard,
  DataEngineeringIcon,
  OpenSourceIcon,
  FeaturedPostsIcon,
  ArchivesIcon,
} from '../components/feature-card'

export default async function Page() {
  const postsByYear = getPostsByAllYear(['slug', 'title', 'date', 'category'])
  const postCount = Object.values(postsByYear).reduce(
    (acc, yearPosts) => acc + yearPosts.length,
    0,
  )

  const years = Object.keys(postsByYear).map(Number)
  const pastYears = new Date().getFullYear() - Math.min(...years)

  return (
    <>
      <Header longText="Data Engineering" />
      <Container>
        <div className="text-lg text-beige-800 leading-relaxed tracking-wide mb-12">
          Lists all {postCount} posts of the past {pastYears} years of blogging.
          You can jump straight to the{' '}
          <Link href="/feed" className="text-beige-600 hover:text-beige-500 underline transition-colors">
            /feed
          </Link>{' '}
          for latest posts, also explore{' '}
          <Link href="/tags" className="text-beige-600 hover:text-beige-500 underline transition-colors">
            by the topics
          </Link>{' '}
          or{' '}
          <Link href="/featured" className="text-beige-600 hover:text-beige-500 underline transition-colors">
            my featured posts
          </Link>
          .
        </div>

        {/* Feature Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            title="Data Engineering"
            description="Technical writings on data systems and infrastructure"
            icon={<DataEngineeringIcon />}
            bgColor="bg-beige-200 dark:bg-brown-700"
          />
          <FeatureCard
            title="Open Source"
            description="Contributions and insights from the open source community"
            href="/tags/opensource"
            icon={<OpenSourceIcon />}
            bgColor="bg-cyan-100 dark:bg-cyan-900"
          />
          <FeatureCard
            title="Featured Posts"
            description="Hand-picked articles worth reading"
            href="/featured"
            icon={<FeaturedPostsIcon />}
            bgColor="bg-purple-100 dark:bg-purple-900"
          />
          <FeatureCard
            title="Archives"
            description={`${postCount} posts from ${pastYears} years`}
            href="/archives"
            icon={<ArchivesIcon />}
            bgColor="bg-beige-200 dark:bg-brown-700"
          />
        </div>

        <h2 className="text-3xl font-bold text-beige-950 dark:text-brown-50 mb-8">
          Recent Posts
        </h2>

        <div className="flex flex-col gap-8">
          {Object.entries(postsByYear)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .map(([year, posts]) => (
              <YearPost key={year} year={parseInt(year)} posts={posts} />
            ))}
        </div>
      </Container>
    </>
  )
}
