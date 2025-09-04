/**
 * PostStatus Component - New/Featured post indicators
 * Extracted from YearPost for better modularity and reusability
 */

import { dateFormat } from '@duyet/libs/date'
import { cn } from '@duyet/libs/utils'
import { Star, Sparkles } from 'lucide-react'

export interface PostStatusProps {
  date?: Date
  featured?: boolean
  className?: string
  showNewLabel?: boolean
  showFeaturedLabel?: boolean
}

export function PostStatus({ 
  date, 
  featured = false, 
  className,
  showNewLabel = true,
  showFeaturedLabel = true
}: PostStatusProps) {
  const isNew = showNewLabel && date && isNewPost(date)
  const shouldShowFeatured = showFeaturedLabel && featured

  if (!isNew && !shouldShowFeatured) {
    return null
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isNew && (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full dark:bg-red-900/30 dark:text-red-400">
          <Sparkles size={12} />
          New
        </span>
      )}
      
      {shouldShowFeatured && (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">
          <Star size={12} className="fill-current" />
          Featured
        </span>
      )}
    </div>
  )
}

/**
 * Check if a post is considered "new" (posted in current month)
 */
function isNewPost(date: Date): boolean {
  const today = new Date()
  return dateFormat(date, 'yyyy-MM') === dateFormat(today, 'yyyy-MM')
}