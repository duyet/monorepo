import Link from 'next/link'

import Container from '@duyet/components/Container'
import { getPostsByAllYear } from '@duyet/libs/getPost'
import { YearPost } from '../../components/year-post'

export const dynamic = 'force-static'

export default function Archives() {
  const postsByYear = getPostsByAllYear(['slug', 'title', 'date', 'category'])
  const postCount = Object.values(postsByYear).reduce(
    (acc, yearPosts) => acc + yearPosts.length,
    0,
  )

  const years = Object.keys(postsByYear).map(Number)
  const pastYears = new Date().getFullYear() - Math.min(...years)

  return (
    <Container>
      <div>
        Lists all {postCount} posts of the past {pastYears} years. You can also
        explore <Link href="/tags">by the topics</Link>.
      </div>
      <div className="flex flex-col gap-8">
        {Object.entries(postsByYear)
          .sort(([a], [b]) => parseInt(b) - parseInt(a))
          .map(([year, posts]) => (
            <YearPost key={year} year={parseInt(year)} posts={posts} />
          ))}
      </div>
    </Container>
  )
}
