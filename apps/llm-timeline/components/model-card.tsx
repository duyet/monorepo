'use client'

import { getLicenseColor, getTypeColor } from '@/lib/utils'
import type { Model } from '@/lib/data'
import { cn } from '@duyet/libs/utils'
import { OrgAvatar } from '@/components/org-avatar'

interface ModelCardProps {
  model: Model
  isLast?: boolean
  lite?: boolean
}

export function ModelCard({ model, isLast, lite }: ModelCardProps) {
  if (lite) {
    return (
      <div className="relative flex items-center gap-3 py-1.5" style={{ minHeight: '32px' }}>
        {/* Small dot indicator */}
        <div
          className="shrink-0"
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: model.type === 'milestone' ? 'var(--accent)' : 'var(--border)',
          }}
        />

        {/* Model name on left */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <OrgAvatar org={model.org} size="sm" />
          <span
            className="truncate text-sm font-medium"
            style={{ color: 'var(--text)' }}
          >
            {model.name}
          </span>
        </div>

        {/* Dots separator */}
        <div
          className="flex-1 px-2"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
            backgroundSize: '4px 4px',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center',
            opacity: 0.4,
          }}
        />

        {/* Year and metadata on right */}
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="text-xs"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
          >
            {model.date.slice(0, 4)}
          </span>
          <span
            className={cn(
              'rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              getTypeColor(model.type)
            )}
          >
            {model.type}
          </span>
          <span
            className={cn(
              'rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              getLicenseColor(model.license)
            )}
          >
            {model.license}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center gap-3 pb-6">
      {/* Timeline Line */}
      {!isLast && (
        <div
          className="absolute left-[7px] top-0 h-full w-px"
          style={{ backgroundColor: 'var(--border)' }}
        />
      )}

      {/* Timeline Dot — larger/accent for milestones */}
      <div
        className={cn(
          'relative z-10 h-3 w-3 shrink-0 rounded-full border-2',
          model.type === 'milestone'
            ? 'border-[--accent] bg-[--accent]'
            : 'border-[--border] bg-[--bg-card]'
        )}
        style={
          model.type === 'milestone'
            ? { borderColor: 'var(--accent)', backgroundColor: 'var(--accent)' }
            : { borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }
        }
      />

      {/* Card */}
      <div
        className="flex-1 rounded-lg border p-4 transition-colors"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-card)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-card-hover)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-card)'
        }}
      >
        {/* Header row */}
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <OrgAvatar org={model.org} size="sm" />
            <div className="min-w-0 flex-1">
              <h3
                className="text-base font-semibold truncate"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)' }}
              >
                {model.name}
              </h3>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {model.org}
              </p>
            </div>
          </div>

          {/* Date + params */}
          <div className="text-right">
            <div
              className="text-xs"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
            >
              {model.date.slice(0, 7)}
            </div>
            {model.params && (
              <div
                className="text-xs"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
              >
                {model.params}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mb-2 flex gap-1.5">
          <span
            className={cn(
              'rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              getTypeColor(model.type)
            )}
          >
            {model.type}
          </span>
          <span
            className={cn(
              'rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              getLicenseColor(model.license)
            )}
          >
            {model.license}
          </span>
        </div>

        {/* Description */}
        <p
          className="text-sm leading-relaxed line-clamp-3"
          style={{ color: 'var(--text-muted)' }}
        >
          {model.desc}
        </p>
      </div>
    </div>
  )
}
