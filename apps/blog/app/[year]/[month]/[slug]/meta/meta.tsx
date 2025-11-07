import Link from 'next/link'

import Icons from '@duyet/components/Icons'
import type { Post } from '@duyet/interfaces'
import { distanceToNow } from '@duyet/libs/date'
import { getSeries } from '@duyet/libs/getSeries'
import { getSlug } from '@duyet/libs/getSlug'
import { cn } from '@duyet/libs/utils'
import { SeriesBox } from '../../../../../components/series'
import { MarkdownMenuWrapper } from './markdown-menu-wrapper'

interface ContentProps {
  post: Post & { markdown_content?: string }
  className?: string
}

export default function Content({ post, className }: ContentProps) {
  const markdownUrl = post.slug.replace(/\.html$/, '.md')

  return (
    <div>
      <div
        className={cn(
          'flex flex-row flex-wrap items-center gap-3',
          'rounded-2xl bg-neutral-50 px-6 py-4',
          'text-sm text-neutral-600',
          className,
        )}
      >
        <time className="font-medium text-neutral-700">
          {post.date.toString()}
        </time>
        <time className="text-neutral-500">
          ({distanceToNow(new Date(post.date))})
        </time>
        <span className="text-neutral-400">•</span>
        <Link
          href={`/category/${post.category_slug}`}
          className="font-medium text-neutral-800 transition-colors hover:text-neutral-900 hover:underline hover:underline-offset-4"
        >
          {post.category}
        </Link>
        <div className="flex flex-row flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              href={`/tag/${getSlug(tag)}`}
              key={tag}
              title={`Tag: ${tag}`}
              className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-300 hover:text-neutral-900"
            >
              {tag}
            </Link>
          ))}
        </div>
        <a
          className="text-neutral-500 transition-colors hover:text-neutral-900"
          href={post.edit_url}
          rel="noopener noreferrer"
          target="_blank"
          title="Edit in Github"
        >
          <Icons.Github className="h-4 w-4" />
        </a>
        {post.markdown_content && (
          <>
            <span className="text-neutral-400">•</span>
            <MarkdownMenuWrapper
              markdownUrl={markdownUrl}
              markdownContent={post.markdown_content}
            />
          </>
        )}
      </div>

      {Boolean(post.series) && (
        <SeriesBox
          className="mt-8"
          current={post.slug}
          series={getSeries({ name: post.series })}
        />
      )}
    </div>
  )
}
