/* eslint-disable @typescript-eslint/no-unsafe-assignment -- IsFeatured */

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
            className="flex flex-row items-center justify-between gap-2"
            key={post.slug}
          >
            <Link as={post.slug} className="text-md truncate" href="/[...slug]">
              {post.title}
              <IsNewPost date={post.date} />
              <IsFeatured featured={post.featured} />
            </Link>
            <hr className="shrink grow border-dotted border-slate-200 opacity-50" />
            <time className="flex-0 flex-nowrap overflow-hidden text-nowrap text-gray-400">
              {dateFormat(post.date, 'MMM do')}
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
