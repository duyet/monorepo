import Link from 'next/link'

import { cn } from '../../../lib/utils'
import type { Post } from '../../../interfaces'
import { getPostsByYear } from '../../../lib/getPost'

type Props = {
  params: {
    year: number
    month: number
  }
}

export default function Year({ params: { year, month } }: Props) {
  const posts = getPostsByYear(year, ['slug', 'title', 'date', 'category'])
  const months = posts.reduce((acc: number[], post: Post) => {
    const month = new Date(post.date).getMonth() + 1

    if (!acc.includes(month)) {
      acc.push(month)
    }

    return acc
  }, [])

  return (
    <>
      <div className='flex flex-auto gap-5 mb-5 border shadow-sx rounded'>
        {months.map((m: number) => {
          return (
            <Link key={m} href={`${year}/${m}`} className='p-4 mr-2'>
              <span className={cn({ 'font-bold': month == m })}>
                {year}/{m}
              </span>
            </Link>
          )
        })}
      </div>

      {posts.map((post: Post) => (
        <article key={post.slug} className='mb-5'>
          <div className='flex flex-row gap-2 mb-2'>
            <time className='text-gray-400'>{post.date.toString()}</time>
            <span className='text-gray-500'>{post.category}</span>
          </div>

          <Link
            as={`${post.slug}`}
            href='/[...slug]'
            className='text-xl font-bold'
          >
            {post.title}
          </Link>
        </article>
      ))}
    </>
  )
}
