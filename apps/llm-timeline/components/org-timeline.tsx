import { ModelCard } from './model-card'
import { OrgAvatar } from './org-avatar'
import type { Model } from '@/lib/data'
import { cn } from '@duyet/libs/utils'

interface OrgTimelineProps {
  modelsByOrg: Map<string, Model[]>
  liteMode?: boolean
}

export function OrgTimeline({ modelsByOrg, liteMode }: OrgTimelineProps) {
  const sortedOrgs = Array.from(modelsByOrg.keys())

  if (sortedOrgs.length === 0) {
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

  return (
    <div className="space-y-8">
      {sortedOrgs.map((org) => {
        const orgModels = modelsByOrg.get(org) || []
        return (
          <div key={org} style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
            {/* Org Header — no timeline dot/line, models provide the timeline flow */}
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
                  {org}
                </span>
              </div>
              <div className="h-px flex-1 min-w-0 shrink" style={{ backgroundColor: 'var(--border)' }} />
              <div className="flex shrink-0 items-center gap-2">
                <OrgAvatar org={org} size="sm" />
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--text)', maxWidth: '12rem' }}
                >
                  {org}
                </span>
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                >
                  {orgModels.length} model{orgModels.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Models for this org — timeline flow handled by ModelCard */}
            <div className="ml-2">
              {orgModels.map((model, index) => (
                <ModelCard
                  key={`${model.date}-${model.name}`}
                  model={model}
                  isLast={index === orgModels.length - 1}
                  lite={liteMode}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
