/**
 * ReadingProgress Component - Visual reading progress indicator
 * Enhances user engagement and content discovery
 */

'use client'

import { cn } from '@duyet/libs/utils'
import { useReadingProgress } from '../hooks/useContentInsights'

export interface ReadingProgressProps {
  className?: string
  variant?: 'bar' | 'circle' | 'minimal'
}

export function ReadingProgress({ 
  className, 
  variant = 'bar' 
}: ReadingProgressProps) {
  const progress = useReadingProgress()

  if (variant === 'circle') {
    return (
      <div className={cn(
        'fixed bottom-8 right-8 z-50',
        'h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border',
        'flex items-center justify-center shadow-lg',
        className
      )}>
        <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-muted"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-primary"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${progress * 0.01 * 100} 100`}
            style={{
              transition: 'stroke-dasharray 0.3s ease',
            }}
          />
        </svg>
        <span className="absolute text-xs font-medium">
          {Math.round(progress)}%
        </span>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={cn(
        'fixed top-0 left-0 right-0 z-50 h-1 bg-muted',
        className
      )}>
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    )
  }

  return (
    <div className={cn(
      'sticky top-0 z-40 h-2 bg-background/95 backdrop-blur-sm border-b',
      className
    )}>
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}