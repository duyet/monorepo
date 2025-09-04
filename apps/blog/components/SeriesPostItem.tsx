/**
 * SeriesPostItem Component - Individual post in series navigation
 * Enhanced with better visual hierarchy and content insights
 */

import Link from 'next/link'
import { cn } from '@duyet/libs/utils'
import type { Post } from '@duyet/interfaces'
import { generateSmartExcerpt } from '../lib/content-utils'

export interface SeriesPostItemProps {
  post: Post
  index: number
  isCurrent?: boolean
  className?: string
}

export function SeriesPostItem({ 
  post, 
  index, 
  isCurrent = false, 
  className 
}: SeriesPostItemProps) {
  const { slug, title, excerpt } = post

  return (
    <div
      className={cn(
        'flex items-center justify-between group',
        isCurrent ? 'text-black dark:text-white' : '',
        className
      )}
    >
      <div className="flex items-center space-x-4">
        <div
          className={cn(
            'text-6xl font-bold text-gray-600 dark:text-gray-600 transition-colors',
            isCurrent && 'text-gray-950 dark:text-gray-300',
            'group-hover:text-gray-800 dark:group-hover:text-gray-400'
          )}
        >
          {index + 1}
        </div>
        
        <div className="flex-1">
          {isCurrent ? (
            <span className="text-black-950 line-clamp-1 text-lg font-medium">
              {title}
            </span>
          ) : (
            <Link
              className="text-black-900 line-clamp-1 text-lg font-medium hover:underline transition-colors hover:text-primary"
              href={slug}
            >
              {title}
            </Link>
          )}

          <p
            className={cn(
              'line-clamp-1 text-sm text-gray-600 dark:text-gray-400 transition-colors',
              isCurrent && 'dark:text-gray-300',
              'group-hover:text-gray-700 dark:group-hover:text-gray-300'
            )}
          >
            {generateSmartExcerpt(excerpt || '', 15)}
          </p>
        </div>
      </div>
    </div>
  )
}