'use client'

import { cn } from '@duyet/libs'

interface LegendProps {
  categories: string[]
  className?: string
}

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function Legend({ categories, className }: LegendProps) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {categories.map((category, index) => (
        <div key={category} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: chartColors[index % chartColors.length] }}
          />
          <span className="text-sm text-muted-foreground">{category}</span>
        </div>
      ))}
    </div>
  )
}
