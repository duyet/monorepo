import Link from 'next/link'

import type { Post } from '../interfaces'
import distanceToNow from '../lib/dateRelative'

export type Props = {
  posts: Post[]
  thumbnail?: boolean
}

export default function Feed({ posts, thumbnail = true }: Props) {
  return (
    <>
      {posts.length ? (
        posts.map((post) => (
          <article key={post.slug} className='mb-20'>
            <div className='flex flex-row gap-2 mb-2 text-gray-400'>
              <time>{post.date.toString()}</time>
              <time>({distanceToNow(new Date(post.date))})</time>

              <Link
                href={`/category/${post.category_slug}`}
                className='text-gray-400'
              >
                in {post.category}
              </Link>
            </div>

            <Link
              as={`${post.slug}`}
              href='/[...slug]'
              className='block text-2xl font-semibold'
            >
              {post.title}
            </Link>

            <p className='mt-4 leading-relaxed'>{post.excerpt}</p>

            {thumbnail && post.thumbnail ? (
              <img src={post.thumbnail} className='mt-4' />
            ) : null}
          </article>
        ))
      ) : (
        <p>No blog posted yet :/</p>
      )}
    </>
  )
}
