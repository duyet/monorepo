import Link from 'next/link'

import Container from '@duyet/components/Container'
import Header from '@duyet/components/Header'
import { getPostsByAllYear } from '@duyet/libs/getPost'
import { YearPost } from '../components/year-post'

export default async function Page() {
  const postsByYear = getPostsByAllYear(['slug', 'title', 'date', 'category'])
  const postCount = Object.values(postsByYear).reduce(
    (acc, yearPosts) => acc + yearPosts.length,
    0,
  )

  const years = Object.keys(postsByYear).map(Number)
  const pastYears = new Date().getFullYear() - Math.min(...years)

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header longText="Data Engineering" />
      <Container>
        <div className="mb-12 text-center">
          <p className="text-lg leading-relaxed text-neutral-700">
            Lists all{' '}
            <strong className="font-semibold text-neutral-900">
              {postCount} posts
            </strong>{' '}
            of the past {pastYears} years of blogging. You can jump straight to
            the{' '}
            <Link
              href="/feed"
              className="text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600"
            >
              /feed
            </Link>{' '}
            for latest posts, also explore{' '}
            <Link
              href="/tags"
              className="text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600"
            >
              by the topics
            </Link>{' '}
            or{' '}
            <Link
              href="/featured"
              className="text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600"
            >
              my featured posts
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {Object.entries(postsByYear)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .map(([year, posts]) => (
              <YearPost key={year} year={parseInt(year)} posts={posts} />
            ))}
        </div>
      </Container>
    </div>
  )
}
