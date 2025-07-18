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
          'mb-8 mt-8 text-5xl font-extrabold',
          'sm:text-6xl',
          'md:mb-10 md:text-8xl md:font-black',
        )}
      >
        {year}
      </h1>

      <div className="flex flex-col gap-3">
        {posts.map((post: Post) => (
          <article
            className="flex flex-row items-center gap-4"
            key={post.slug}
          >
              <Link as={post.slug} className="text-md hover:underline" href="/[...slug]">
                {post.title}
                <IsNewPost date={post.date} />
                <IsFeatured featured={post.featured} />
              </Link>
            <hr className="shrink grow border-dotted border-slate-200 opacity-50" />
            <time className="flex-shrink-0 text-sm font-mono text-muted-foreground whitespace-nowrap">
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

  return <span className="ml-2 text-sm text-red-500">New</span>
}

function IsFeatured({ featured }: { featured: boolean }) {
  if (!featured) {
    return null
  }

  return (
    <span className="ml-2 text-sm font-bold uppercase text-red-600">
      Featured
    </span>
  )
}
