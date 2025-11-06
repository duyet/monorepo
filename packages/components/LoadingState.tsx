'use client'

import { RefreshCw } from 'lucide-react'
import { cn } from '@duyet/libs/utils'

/**
 * Shared loading state components for consistent UX across apps
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  color?: 'white' | 'gray' | 'primary'
}

/**
 * Animated loading spinner
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  className,
  color = 'gray',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const colorClasses = {
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent dark:border-gray-500',
    primary: 'border-blue-600 border-t-transparent',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        colorClasses[color],
        className,
      )}
      aria-label="Loading..."
      role="status"
    />
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Full loading state with spinner and optional message
 *
 * @example
 * ```tsx
 * <LoadingState message="Loading data..." />
 * ```
 */
export function LoadingState({
  message = 'Loading...',
  className,
  size = 'md',
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[200px] items-center justify-center',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size={size} />
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

/**
 * Simple loading spinner with icon (legacy/alternative)
 */
export function LoadingIcon({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-gray-600 dark:text-gray-400', className)}>
      <RefreshCw className="h-4 w-4 animate-spin" />
      <span>Loading...</span>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

/**
 * Empty state component for when there's no data
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No photos found"
 *   description="Try uploading some photos"
 *   icon={<ImageIcon className="h-12 w-12" />}
 *   action={<button>Upload Photo</button>}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[300px] items-center justify-center text-center',
        'rounded-lg border-2 border-dashed border-gray-300 bg-gray-50',
        'dark:border-gray-600 dark:bg-gray-800',
        className,
      )}
    >
      <div className="max-w-md space-y-4 p-6">
        {icon && <div className="mx-auto w-fit text-gray-400">{icon}</div>}

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  )
}

interface ImageSkeletonProps {
  aspectRatio?: string
  className?: string
  animated?: boolean
}

/**
 * Skeleton loader for images
 */
export function ImageSkeleton({
  aspectRatio = '1/1',
  className,
  animated = true,
}: ImageSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        animated && 'animate-pulse',
        className,
      )}
      style={{ aspectRatio }}
      aria-label="Loading image..."
      role="status"
    />
  )
}

interface SkeletonCardProps {
  className?: string
  showMetadata?: boolean
  lines?: number
}

/**
 * Skeleton loader for card components
 *
 * @example
 * ```tsx
 * <SkeletonCard lines={3} showMetadata />
 * ```
 */
export function SkeletonCard({
  className,
  showMetadata = true,
  lines = 2,
}: SkeletonCardProps) {
  return (
    <div className={cn('flex flex-col space-y-3', className)}>
      <div className="h-[125px] w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
      {showMetadata && (
        <div className="space-y-2">
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700',
                i === lines - 1 ? 'w-3/4' : 'w-full',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ProgressiveLoadingProps {
  isLoading: boolean
  hasError?: boolean
  isEmpty?: boolean
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/**
 * Progressive loading wrapper that handles loading, error, and empty states
 *
 * @example
 * ```tsx
 * <ProgressiveLoading
 *   isLoading={loading}
 *   hasError={!!error}
 *   isEmpty={data.length === 0}
 *   loadingComponent={<LoadingState />}
 *   errorComponent={<ErrorDisplay error={error} />}
 *   emptyComponent={<EmptyState title="No data" />}
 * >
 *   <DataComponent data={data} />
 * </ProgressiveLoading>
 * ```
 */
export function ProgressiveLoading({
  isLoading,
  hasError = false,
  isEmpty = false,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  className,
}: ProgressiveLoadingProps) {
  if (isLoading) {
    return (
      <div className={className}>
        {loadingComponent || <LoadingState />}
      </div>
    )
  }

  if (hasError) {
    return <div className={className}>{errorComponent}</div>
  }

  if (isEmpty) {
    return (
      <div className={className}>
        {emptyComponent || <EmptyState title="No data available" />}
      </div>
    )
  }

  return <div className={className}>{children}</div>
}
