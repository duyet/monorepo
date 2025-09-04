/**
 * PostMeta Component - Enhanced post metadata display
 * Provides reading time, complexity, and content insights
 */

import type { Post } from '@duyet/interfaces'
import { getContentInsights, formatReadingTime } from '../lib/content-utils'
import { cn } from '@duyet/libs/utils'
import { Clock, BookOpen, Star } from 'lucide-react'

export interface PostMetaProps {
  post: Post
  showReadingTime?: boolean
  showComplexity?: boolean
  showTopics?: boolean
  className?: string
}

export function PostMeta({ 
  post, 
  showReadingTime = true,
  showComplexity = false,
  showTopics = true,
  className 
}: PostMetaProps) {
  const insights = getContentInsights(post)

  return (
    <div className={cn('flex flex-wrap items-center gap-4 text-sm text-muted-foreground', className)}>
      {showReadingTime && (
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{formatReadingTime(insights.readingTime.minutes)}</span>
        </div>
      )}

      {showComplexity && (
        <div className="flex items-center gap-1">
          <BookOpen size={14} />
          <span className="capitalize">{insights.complexity}</span>
        </div>
      )}

      {post.featured && (
        <div className="flex items-center gap-1">
          <Star size={14} className="fill-current text-yellow-500" />
          <span className="font-medium text-yellow-600">Featured</span>
        </div>
      )}

      {showTopics && insights.topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {insights.topics.slice(0, 3).map((topic) => (
            <span 
              key={topic}
              className="px-2 py-1 text-xs bg-muted rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}