import Link from 'next/link'

import type { Post } from '@duyet/interfaces'
import { dateFormat } from '@duyet/libs/date'
import { getPostsByYear } from '@duyet/libs/getPost'
import { cn } from '@duyet/libs/utils'

export interface YearPostProps {
  year: number
  className?: string
}

export function YearPost({ year, className }: YearPostProps) {
  const posts = getPostsByYear(year, ['slug', 'title', 'date', 'category'])

  if (!posts.length) {
    return null
  }

  return (
    <div className={cn(className)}>
      <h1
        className={cn(
          'mb-8 mt-8 text-5xl font-extrabold',
          'sm:text-6xl',
          'md:mb-10 md:text-8xl md:font-black',
        )}
      >
        <Link as={`/${year}`} href="/[year]">
          {year}
        </Link>
      </h1>

      <div className="flex flex-col gap-3">
        {posts.map((post: Post) => (
          <article
            className="flex flex-row items-center justify-between gap-2"
            key={post.slug}
          >
            <Link as={post.slug} className="text-md truncate" href="/[...slug]">
              {post.title}
              <IsNewPost date={post.date} />
            </Link>
            <hr className="shrink grow border-dotted border-slate-200 opacity-50" />
            <time className="flex-0 flex-nowrap overflow-hidden text-nowrap text-gray-400">
              {dateFormat(post.date, 'MMMM do')}
            </time>
          </article>
        ))}
      </div>
    </div>
  )
}

function IsNewPost({ date }: { date: Date | undefined }) {
  const today = new Date()

  if (!date || dateFormat(date, 'yyyy-MM') !== dateFormat(today, 'yyyy-MM')) {
    return null
  }

  return <span className="ml-2 text-sm text-red-500">New</span>
}
