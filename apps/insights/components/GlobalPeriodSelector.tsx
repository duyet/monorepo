'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DEFAULT_PERIOD, PERIODS, type PeriodValue } from '@/lib/periods'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function GlobalPeriodSelector() {
  const pathname = usePathname()

  // Extract current tab and period from pathname
  // Patterns: /blog, /blog/30, /github, /github/7, etc.
  const segments = pathname.split('/').filter(Boolean)
  const currentTab = segments[0] || ''
  const currentPeriod = (segments[1] || DEFAULT_PERIOD) as PeriodValue

  // Only show on analytics tabs
  const validTabs = ['blog', 'github', 'wakatime', 'ai']
  if (!validTabs.includes(currentTab)) {
    return null
  }

  return (
    <Tabs value={currentPeriod}>
      <TabsList>
        {PERIODS.map((period) => (
          <Link key={period.value} href={`/${currentTab}/${period.value}`}>
            <TabsTrigger value={period.value}>{period.label}</TabsTrigger>
          </Link>
        ))}
      </TabsList>
    </Tabs>
  )
}
