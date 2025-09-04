/**
 * PostList Component - Enhanced post listing with intelligent layout
 * Replaces repetitive post mapping logic with reusable component
 */

import type { Post } from '@duyet/interfaces'
import { cn } from '@duyet/libs/utils'
import { PostCard } from './PostCard'

export interface PostListProps {
  posts: Post[]
  variant?: 'default' | 'compact' | 'grid'
  showThumbnails?: boolean
  showExcerpts?: boolean
  showMeta?: boolean
  className?: string
  emptyMessage?: string
}

export function PostList({
  posts,
  variant = 'default',
  showThumbnails = true,
  showExcerpts = true,
  showMeta = true,
  className,
  emptyMessage = 'No posts found.'
}: PostListProps) {
  if (!posts?.length) {
    return (
      <div className={cn('py-8 text-center text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    )
  }

  const isGrid = variant === 'grid'
  const isCompact = variant === 'compact'

  return (
    <div className={cn(
      isGrid 
        ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
        : 'flex flex-col gap-4',
      className
    )}>
      {posts.map((post) => (
        <PostCard
          key={post.slug}
          post={post}
          variant={isCompact ? 'compact' : 'default'}
          showThumbnail={showThumbnails}
          showExcerpt={showExcerpts}
          showMeta={showMeta}
          className={isGrid ? 'border rounded-lg p-4 hover:shadow-md transition-shadow' : ''}
        />
      ))}
    </div>
  )
}