/**
 * YearHeader Component - Year display header
 * Extracted from YearPost for better separation of concerns
 */

import { cn } from '@duyet/libs/utils'

export interface YearHeaderProps {
  year: number
  className?: string
}

export function YearHeader({ year, className }: YearHeaderProps) {
  return (
    <h1
      className={cn(
        'mb-8 mt-8 text-5xl font-extrabold',
        'sm:text-6xl',
        'md:mb-10 md:text-8xl md:font-black',
        className
      )}
    >
      {year}
    </h1>
  )
}