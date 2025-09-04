/**
 * ContentInsights Component - Enhanced content analysis display
 * Provides reading analytics and content structure insights
 */

import type { Post } from '@duyet/interfaces'
import { cn } from '@duyet/libs/utils'
import { useContentInsights } from '../hooks/useContentInsights'
import { formatReadingTime } from '../lib/content-utils'
import { Clock, BookOpen, Target, Tag } from 'lucide-react'

export interface ContentInsightsProps {
  post: Post
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export function ContentInsights({ 
  post, 
  variant = 'default',
  className 
}: ContentInsightsProps) {
  const insights = useContentInsights(post)
  const isCompact = variant === 'compact'
  const isDetailed = variant === 'detailed'

  if (isCompact) {
    return (
      <div className={cn('flex items-center gap-4 text-sm text-muted-foreground', className)}>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{formatReadingTime(insights.readingTime.minutes)}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <BookOpen size={14} />
          <span className="capitalize">{insights.complexity}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'rounded-lg bg-muted/50 p-6 space-y-4',
      'border border-border',
      className
    )}>
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <Target className="h-5 w-5" />
        Content Insights
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-4 rounded-lg bg-background">
          <Clock className="h-8 w-8 text-blue-500 mb-2" />
          <span className="text-2xl font-bold">
            {insights.readingTime.minutes}
          </span>
          <span className="text-sm text-muted-foreground">
            minute{insights.readingTime.minutes !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-background">
          <BookOpen className="h-8 w-8 text-green-500 mb-2" />
          <span className="text-lg font-semibold capitalize">
            {insights.complexity}
          </span>
          <span className="text-sm text-muted-foreground">
            Level
          </span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-background">
          <Tag className="h-8 w-8 text-purple-500 mb-2" />
          <span className="text-2xl font-bold">
            {insights.topics.length}
          </span>
          <span className="text-sm text-muted-foreground">
            Topic{insights.topics.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-background">
          <div className="text-2xl mb-2">📝</div>
          <span className="text-2xl font-bold">
            {Math.round(insights.readingTime.words / 1000 * 10) / 10}k
          </span>
          <span className="text-sm text-muted-foreground">
            Words
          </span>
        </div>
      </div>

      {isDetailed && insights.topics.length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Topics Covered</h4>
          <div className="flex flex-wrap gap-2">
            {insights.topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}