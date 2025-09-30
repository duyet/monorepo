'use client'

import { cn } from '../../lib/utils'
import { ReactNode } from 'react'

interface DashboardGridProps {
  children: ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg'
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 lg:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
  12: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12',
}

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
}

export function DashboardGrid({
  children,
  className,
  cols = 3,
  gap = 'md',
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        'grid',
        colsClasses[cols],
        gapClasses[gap],
        className,
      )}
    >
      {children}
    </div>
  )
}

interface GridItemProps {
  children: ReactNode
  className?: string
  span?: 1 | 2 | 3 | 4 | 6 | 12
  spanMd?: 1 | 2 | 3 | 4 | 6 | 12
  spanLg?: 1 | 2 | 3 | 4 | 6 | 12
}

const spanClasses = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  6: 'col-span-6',
  12: 'col-span-12',
}

export function GridItem({
  children,
  className,
  span = 1,
  spanMd,
  spanLg,
}: GridItemProps) {
  return (
    <div
      className={cn(
        spanClasses[span],
        spanMd && `md:${spanClasses[spanMd]}`,
        spanLg && `lg:${spanClasses[spanLg]}`,
        className,
      )}
    >
      {children}
    </div>
  )
}