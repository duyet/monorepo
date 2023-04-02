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
            <div className='flex flex-row gap-2 mb-2'>
              <time className='text-gray-400'>
                {distanceToNow(new Date(post.date))}
              </time>
              <Link
                href={`/category/${post.category_slug}`}
                className='rounded uppercase bg-sky-100 font-bold text-sm text-sky-600 px-2 py-1'
              >
                {post.category}
              </Link>
            </div>

            <Link
              as={`${post.slug}`}
              href='/[...slug]'
              className='text-2xl leading-6 font-bold'
            >
              {post.title}
            </Link>

            <p className='mt-4'>{post.excerpt}</p>

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
