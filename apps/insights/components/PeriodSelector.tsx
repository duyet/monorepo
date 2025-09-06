'use client'

import { Button } from '@duyet/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { TIME_PERIODS, type TimePeriod } from '@/types/periods'

interface PeriodSelectorProps {
  activePeriod: TimePeriod
  onPeriodChange: (period: TimePeriod) => void
  className?: string
}

export function PeriodSelector({ 
  activePeriod, 
  onPeriodChange, 
  className = '' 
}: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activePeriodLabel = TIME_PERIODS.find(p => p.value === activePeriod)?.label || '30 days'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handlePeriodSelect = (period: TimePeriod) => {
    onPeriodChange(period)
    setIsOpen(false)
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-[100px] justify-between"
        aria-expanded={isOpen}
        aria-haspopup={true}
      >
        <span>Time period: {activePeriodLabel}</span>
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 min-w-[140px] origin-top-right rounded-md border bg-popover p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodSelect(period.value)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors ${
                  activePeriod === period.value
                    ? 'bg-accent text-accent-foreground font-medium'
                    : ''
                }`}
                role="menuitem"
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}