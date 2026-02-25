'use client'

import { Suspense } from 'react'
import { AppClient } from '@/components/app-client'
import type { Model } from '@/lib/data'
import type { FilterState } from '@/lib/utils'

type View = 'models' | 'organizations' | 'open'

interface SearchParamsWrapperProps {
  initialModels: Model[]
  stats: {
    models: number
    organizations: number
    open: number
  }
  initialView?: View
  initialLicense?: FilterState['license']
  initialLiteMode?: boolean
}

function AppClientInner({ initialModels, stats, initialView, initialLicense, initialLiteMode }: SearchParamsWrapperProps) {
  return <AppClient initialModels={initialModels} stats={stats} initialView={initialView} initialLicense={initialLicense} initialLiteMode={initialLiteMode} />
}

export function SearchParamsWrapper(props: SearchParamsWrapperProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppClientInner {...props} />
    </Suspense>
  )
}
