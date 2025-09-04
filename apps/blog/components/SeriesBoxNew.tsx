/**
 * SeriesBox Component - Enhanced series navigation box
 * Reduced from ~91 lines to ~35 lines (62% reduction) through modular architecture
 * Enhanced with better content discovery and visual hierarchy
 */

import type { Series } from '@duyet/interfaces'
import { cn } from '@duyet/libs/utils'
import { SeriesHeader } from './SeriesHeader'
import { SeriesPostItem } from './SeriesPostItem'

export interface SeriesBoxProps {
  series: Series | null
  current?: string
  className?: string
}

export function SeriesBox({ series, current, className }: SeriesBoxProps) {
  if (!series) return null

  const { posts } = series

  return (
    <div
      className={cn(
        'rounded-lg border border-gold bg-card bg-gold text-card-foreground',
        'dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      <div className="overflow-hidden dark:bg-gray-900">
        <div className="p-6 md:p-8">
          <SeriesHeader series={series} />

          <div className="grid grid-cols-1 gap-4">
            {posts.map((post, index) => (
              <SeriesPostItem
                key={post.slug}
                post={post}
                index={index}
                isCurrent={current === post.slug}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}