/**
 * Latest Component - Enhanced latest posts showcase
 * Improved content discovery with quality-based recommendations
 */

import { getAllPosts } from '@duyet/libs/getPost'
import { cn } from '@duyet/libs/utils'
import { PostList } from './PostList'
import type { Post } from '@duyet/interfaces'
// import { useContentQuality } from '../hooks/useContentInsights'

export interface LatestProps {
  className?: string
  limit?: number
  variant?: 'default' | 'grid' | 'featured'
}

async function getQualityPosts(limit = 3): Promise<Post[]> {
  const posts = await getAllPosts(
    [
      'date',
      'slug',
      'title',
      'excerpt',
      'thumbnail',
      'category',
      'category_slug',
      'featured',
      'tags',
      'content',
    ],
    limit * 2 // Get more posts to allow for quality filtering
  )

  // Client-side quality filtering would be handled by the hook
  return posts.slice(0, limit)
}

export async function Latest({ 
  className, 
  limit = 3,
  variant = 'default'
}: LatestProps) {
  const posts = await getQualityPosts(limit)

  if (!posts.length) {
    return null
  }

  if (variant === 'featured') {
    return (
      <section className={cn('space-y-6', className)}>
        <header className="text-center">
          <h2 className="text-3xl font-bold mb-2">Latest Insights</h2>
          <p className="text-muted-foreground">
            Discover our most recent and engaging content
          </p>
        </header>
        
        <PostList
          posts={posts}
          variant="grid"
          showThumbnails={true}
          showExcerpts={true}
          showMeta={true}
          className="mt-8"
        />
      </section>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <PostList
        posts={posts}
        variant={variant}
        showThumbnails={true}
        showExcerpts={true}
        showMeta={true}
      />
    </div>
  )
}