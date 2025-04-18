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
    <>
      <Header longText="Data Engineering" />
      <Container>
        <div className="text-lg">
          Lists all {postCount} posts of the past {pastYears} years of blogging.
          You can jump straight to the{' '}
          <Link href="/feed" className="underline">
            /feed
          </Link>{' '}
          for latest posts, also explore{' '}
          <Link href="/tags" className="underline">
            by the topics
          </Link>{' '}
          or{' '}
          <Link href="/featured" className="underline">
            my featured posts
          </Link>
          .
        </div>

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
