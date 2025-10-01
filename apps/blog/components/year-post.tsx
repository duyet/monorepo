import Link from 'next/link'

import type { Post } from '@duyet/interfaces'
import { dateFormat } from '@duyet/libs/date'
import { cn } from '@duyet/libs/utils'

export interface YearPostProps {
  year: number
  posts: Post[]
  className?: string
}

export function YearPost({ year, posts, className }: YearPostProps) {
  if (!posts.length) {
    return null
  }

  return (
    <div className={cn(className)}>
      <h1
        className={cn(
          'mb-8 font-serif text-5xl font-bold text-neutral-900',
          'sm:text-6xl',
          'md:mb-10 md:text-7xl',
        )}
      >
        {year}
      </h1>

      <div className="flex flex-col gap-4">
        {posts.map((post: Post) => (
          <article
            className="group flex flex-row items-center gap-4 py-1"
            key={post.slug}
          >
            <Link
              as={post.slug}
              className="text-base text-neutral-800 transition-colors hover:text-neutral-900 hover:underline hover:underline-offset-4"
              href="/[...slug]"
            >
              {post.title}
              <IsNewPost date={post.date} />
              <IsFeatured featured={post.featured} />
            </Link>
            <hr className="shrink grow border-dotted border-neutral-300" />
            <time className="flex-shrink-0 whitespace-nowrap text-sm text-neutral-500">
              {dateFormat(post.date, 'MMM dd')}
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

  return (
    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
      New
    </span>
  )
}

function IsFeatured({ featured }: { featured: boolean }) {
  if (!featured) {
    return null
  }

  return (
    <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
      Featured
    </span>
  )
}
