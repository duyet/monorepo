'use client'

import { useState } from 'react'
import { DATE_RANGES } from './hooks'
import type { DateFilterProps, DateRangeConfig } from './types'

// Re-export for backward compatibility
export type DateRange = DateRangeConfig

export function DateFilter({
  defaultValue = '30d',
  onValueChange,
  className,
}: DateFilterProps) {
  const [selectedValue, setSelectedValue] = useState(defaultValue)

  const handleValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setSelectedValue(value)
    const range = DATE_RANGES.find((r) => r.value === value)
    if (range) {
      onValueChange(range)
    }
  }

  return (
    <select
      value={selectedValue}
      onChange={handleValueChange}
      className={`rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${className}`}
    >
      {DATE_RANGES.map((range) => (
        <option key={range.value} value={range.value}>
          {range.label}
        </option>
      ))}
    </select>
  )
}

// Re-export from hooks for backward compatibility
export { DATE_RANGES }