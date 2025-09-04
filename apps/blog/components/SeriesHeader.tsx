/**
 * SeriesHeader Component - Series title and navigation header
 * Extracted from SeriesBox for better separation of concerns
 */

import Link from 'next/link'
import { cn } from '@duyet/libs/utils'
import { NewspaperIcon } from 'lucide-react'
import type { Series } from '@duyet/interfaces'

export interface SeriesHeaderProps {
  series: Series
  className?: string
}

export function SeriesHeader({ series, className }: SeriesHeaderProps) {
  return (
    <h2 className={cn(
      'text-gradient-to-r mb-4 flex flex-row items-center gap-2 from-green-400 to-blue-500 text-2xl font-bold',
      className
    )}>
      <NewspaperIcon size={24} strokeWidth={1} />
      Series:{' '}
      <Link
        className="underline-offset-8 hover:underline"
        href={`/series/${series.slug}`}
      >
        {series.name}
      </Link>
    </h2>
  )
}