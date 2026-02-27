'use client'

import { useRef, useState, useEffect } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { ModelCard } from './model-card'
import { OrgAvatar } from './org-avatar'
import type { Model } from '@/lib/data'

interface VirtualOrgTimelineProps {
  modelsByOrg: Map<string, Model[]>
  liteMode?: boolean
}

interface VirtualItem {
  type: 'group' | 'model'
  key: string
  org?: string
  model?: Model
  groupIndex?: number
  modelCount?: number
}

export function VirtualOrgTimeline({ modelsByOrg, liteMode }: VirtualOrgTimelineProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(200) // Default offset

  // Calculate offset from top of page when container mounts
  useEffect(() => {
    if (parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setScrollMargin(rect.top + scrollTop)
    }
  }, [])

  const sortedOrgs = Array.from(modelsByOrg.keys())

  // Flatten grouped data into a list of virtual items
  const virtualItems: VirtualItem[] = []
  sortedOrgs.forEach((org) => {
    const orgModels = modelsByOrg.get(org) || []
    // Add group header
    virtualItems.push({
      type: 'group',
      key: `group-${org}`,
      org,
      modelCount: orgModels.length,
    })
    // Add models
    orgModels.forEach((model) => {
      virtualItems.push({
        type: 'model',
        key: `${model.date}-${model.name}`,
        model,
      })
    })
  })

  if (virtualItems.length === 0) {
    return (
      <div
        className="rounded-lg border p-8 text-center"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <p style={{ color: 'var(--text-muted)' }}>
          No models found matching your filters.
        </p>
      </div>
    )
  }

  const rowVirtualizer = useWindowVirtualizer({
    count: virtualItems.length,
    scrollMargin: scrollMargin, // Offset from top of page
    estimateSize: (index) => {
      const item = virtualItems[index]
      if (item.type === 'group') return 100 // Org header height (includes avatar)
      return liteMode ? 100 : 180 // Model card height
    },
    overscan: 5,
  })

  return (
    <div className="rounded-lg">
      <div
        ref={parentRef}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
          width: '100%',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = virtualItems[virtualRow.index]
          const isGroup = item.type === 'group'

          if (isGroup) {
            const groupItem = item as VirtualItem & { type: 'group'; modelCount: number }
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: '0 1rem',
                }}
              >
                {/* Org Header */}
                <div className="mb-6 flex items-center gap-4 overflow-hidden">
                  <div className="shrink-0 overflow-hidden">
                    <span
                      className="select-none text-3xl font-bold leading-none block"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--year-watermark)',
                        whiteSpace: 'nowrap',
                      }}
                      aria-hidden="true"
                    >
                      {groupItem.org}
                    </span>
                  </div>
                  <div className="h-px flex-1 min-w-0 shrink" style={{ backgroundColor: 'var(--border)' }} />
                  <div className="flex shrink-0 items-center gap-2">
                    <OrgAvatar org={groupItem.org!} size="sm" />
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--text)', maxWidth: '12rem' }}
                    >
                      {groupItem.org}
                    </span>
                    <span
                      className="text-xs uppercase tracking-widest"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                    >
                      {groupItem.modelCount} model{groupItem.modelCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            )
          }

          // Model card
          const modelItem = item as VirtualItem & { type: 'model' }
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                paddingLeft: '1rem',
                paddingRight: '1rem',
              }}
            >
              <ModelCard
                model={modelItem.model!}
                lite={liteMode}
                isLast={false}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
