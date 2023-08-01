import Link from 'next/link'

import type { Post } from '../../interfaces'
import { getPostsByYear, getPostsByAllYear } from '../../lib/getPost'
import YearList from '../../components/YearList'

type Props = {
  params: {
    year: number
  }
}

export default function Year({ params: { year } }: Props) {
  const posts = getPostsByYear(year, ['slug', 'title', 'date', 'category'])

  if (!posts) return null

  return (
    <>
      <h1 className="text-3xl font-bold mb-5 mt-10">{year}</h1>

      {posts.map((post: Post) => (
        <article key={post.slug} className="mb-5">
          <div className="flex flex-row gap-2 mb-2">
            <time className="text-gray-400">{post.date.toString()}</time>
            <span className="text-gray-500">{post.category}</span>
          </div>

          <Link
            as={`${post.slug}`}
            href="/[...slug]"
            className="text-xl font-bold"
          >
            {post.title}
          </Link>
        </article>
      ))}

      <div className="mt-10">
        <YearList />
      </div>
    </>
  )
}

export async function generateStaticParams() {
  const posts = getPostsByAllYear()

  return Object.keys(posts).map((year) => ({
    year,
  }))
}
