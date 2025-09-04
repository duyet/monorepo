/**
 * PostCard Component - Enhanced post display card
 * Modular post preview with insightful metadata and content discovery
 */

import Link from 'next/link'
import type { Post } from '@duyet/interfaces'
import { cn } from '@duyet/libs/utils'
import { dateFormat } from '@duyet/libs/date'
import { Thumb } from '@duyet/components/Thumb'
import { PostMeta } from './PostMeta'
import { generateSmartExcerpt } from '../lib/content-utils'

export interface PostCardProps {
  post: Post
  variant?: 'default' | 'compact' | 'featured'
  showThumbnail?: boolean
  showExcerpt?: boolean
  showMeta?: boolean
  className?: string
}

export function PostCard({ 
  post, 
  variant = 'default',
  showThumbnail = true,
  showExcerpt = true,
  showMeta = true,
  className 
}: PostCardProps) {
  const isCompact = variant === 'compact'
  const isFeatured = variant === 'featured'

  return (
    <article className={cn(
      'group relative overflow-hidden transition-all duration-200',
      isFeatured && 'border-l-4 border-l-yellow-500 pl-4',
      className
    )}>
      <Link href={post.slug} className="block">
        <div className={cn(
          'flex gap-4',
          isCompact ? 'items-center' : 'flex-col sm:flex-row',
        )}>
          {showThumbnail && post.thumbnail && (
            <div className={cn(
              'flex-shrink-0 overflow-hidden rounded-lg',
              isCompact ? 'h-16 w-16' : 'h-32 w-full sm:w-48'
            )}>
              <Thumb
                url={post.thumbnail}
                alt={post.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                unoptimized
              />
            </div>
          )}

          <div className="flex-1 space-y-2">
            <header>
              <h3 className={cn(
                'font-semibold leading-tight group-hover:text-primary transition-colors',
                isCompact ? 'text-base' : 'text-lg sm:text-xl',
                isFeatured && 'text-yellow-800 dark:text-yellow-200'
              )}>
                {post.title}
              </h3>
              
              <time className="text-sm text-muted-foreground">
                {dateFormat(post.date, 'MMM dd, yyyy')}
              </time>
            </header>

            {showExcerpt && post.excerpt && (
              <p className={cn(
                'text-muted-foreground leading-relaxed',
                isCompact ? 'text-sm line-clamp-1' : 'text-sm line-clamp-2'
              )}>
                {generateSmartExcerpt(post.excerpt, isCompact ? 15 : 30)}
              </p>
            )}

            {showMeta && (
              <PostMeta 
                post={post}
                showComplexity={!isCompact}
                showTopics={!isCompact}
              />
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}