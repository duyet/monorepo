'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function LoadingIndicator({ size = 'md', className }: LoadingIndicatorProps) {
  return (
    <Loader2
      className={cn(
        'animate-spin text-blue-600 dark:text-blue-400',
        sizeClasses[size],
        className,
      )}
    />
  )
}