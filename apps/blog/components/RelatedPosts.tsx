/**
 * RelatedPosts Component - Intelligent content recommendations
 * Enhanced content discovery based on content analysis and similarity
 */

import type { Post } from '@duyet/interfaces'
import { cn } from '@duyet/libs/utils'
import { useRelatedPosts } from '../hooks/useContentInsights'
import { PostList } from './PostList'
import { ArrowRight } from 'lucide-react'

export interface RelatedPostsProps {
  currentPost: Post
  allPosts: Post[]
  limit?: number
  title?: string
  className?: string
}

export function RelatedPosts({
  currentPost,
  allPosts,
  limit = 3,
  title = 'Related Posts',
  className
}: RelatedPostsProps) {
  const relatedPosts = useRelatedPosts(currentPost, allPosts, limit)

  if (!relatedPosts.length) {
    return null
  }

  return (
    <section className={cn('space-y-6', className)}>
      <header className="flex items-center gap-2 border-b pb-3">
        <h2 className="text-2xl font-bold">{title}</h2>
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Based on your reading preferences
        </span>
      </header>

      <PostList
        posts={relatedPosts}
        variant="compact"
        showExcerpts={true}
        showMeta={true}
        className="space-y-4"
      />
    </section>
  )
}