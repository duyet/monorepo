import Link from 'next/link'

import Container from '@duyet/components/Container'
import { getPostsByAllYear } from '@duyet/libs/getPost'
import { YearPost } from '../../components/year-post'

export default function Archives() {
  const postsByYear = getPostsByAllYear(
    ['slug', 'title', 'date', 'category', 'featured'],
    -1,
    true,
  )

  return (
    <Container>
      <div>
        This page highlights featured blog posts. You can also explore{' '}
        <Link href="/" className="underline">
          all posts
        </Link>{' '}
        or{' '}
        <Link href="/tags" className="underline">
          by the topics
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
  )
}
