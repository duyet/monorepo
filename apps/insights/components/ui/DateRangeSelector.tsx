'use client'

import { cn } from '@/lib/utils'
import { Calendar, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export type DateRange = '7d' | '30d' | '90d' | '6m' | '1y' | 'all'

interface DateRangeOption {
  value: DateRange
  label: string
  description: string
}

const dateRangeOptions: DateRangeOption[] = [
  { value: '7d', label: '7 days', description: 'Last 7 days' },
  { value: '30d', label: '30 days', description: 'Last 30 days' },
  { value: '90d', label: '90 days', description: 'Last 3 months' },
  { value: '6m', label: '6 months', description: 'Last 6 months' },
  { value: '1y', label: '1 year', description: 'Last 12 months' },
  { value: 'all', label: 'All time', description: 'All available data' },
]

interface DateRangeSelectorProps {
  value: DateRange
  onChange: (value: DateRange) => void
  className?: string
  compact?: boolean
  disabled?: boolean
}

export function DateRangeSelector({
  value,
  onChange,
  className,
  compact = false,
  disabled = false,
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = dateRangeOptions.find(
    (option) => option.value === value,
  )

  if (compact) {
    return (
      <div className={cn('flex space-x-1', className)}>
        {dateRangeOptions.slice(0, 4).map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50',
              value === option.value
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center space-x-2 rounded-lg border bg-background px-3 py-2 text-sm',
          'transition-colors hover:bg-accent hover:text-accent-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        )}
      >
        <Calendar className="h-4 w-4" />
        <span>{selectedOption?.label || 'Select range'}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border bg-card shadow-lg">
            <div className="p-2">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-start rounded-md p-2 text-left transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    value === option.value
                      ? 'bg-accent text-accent-foreground'
                      : 'text-card-foreground',
                  )}
                >
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface QuickFiltersProps {
  currentRange: DateRange
  onRangeChange: (range: DateRange) => void
  className?: string
  showLabels?: boolean
}

export function QuickFilters({
  currentRange,
  onRangeChange,
  className,
  showLabels = true,
}: QuickFiltersProps) {
  const quickRanges: DateRange[] = ['7d', '30d', '90d', '1y']

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {showLabels && (
        <span className="text-xs font-medium text-muted-foreground">
          Quick:
        </span>
      )}
      {quickRanges.map((range) => {
        const option = dateRangeOptions.find((opt) => opt.value === range)
        return (
          <button
            key={range}
            onClick={() => onRangeChange(range)}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              currentRange === range
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground',
            )}
          >
            {option?.label}
          </button>
        )
      })}
    </div>
  )
}
