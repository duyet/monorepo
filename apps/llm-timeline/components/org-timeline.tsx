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
      {sortedOrgs.map((org, orgIndex) => {
        const orgModels = modelsByOrg.get(org) || []
        const isLastOrg = orgIndex === sortedOrgs.length - 1
        return (
          <div key={org} style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
            {/* Org Header with timeline treatment */}
            <div className="mb-6 relative flex gap-4">
              {/* Timeline Line */}
              {!isLastOrg && (
                <div
                  className="absolute left-[11px] top-6 h-full w-px"
                  style={{ backgroundColor: 'var(--border)' }}
                />
              )}

              {/* Timeline Dot for org header */}
              <div
                className="relative z-10 mt-2 h-5 w-5 shrink-0 rounded-full border-2"
                style={{
                  borderColor: 'var(--accent)',
                  backgroundColor: 'var(--accent)',
                }}
              />

              {/* Header content */}
              <div className="flex-1 flex items-center gap-4">
                <div
                  className="overflow-hidden"
                  style={{ maxWidth: '14rem', flexShrink: 0 }}
                >
                  <span
                    className="select-none text-5xl font-bold leading-none"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--year-watermark)',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'clip',
                    }}
                    aria-hidden="true"
                  >
                    {org}
                  </span>
                </div>
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                <div className="flex shrink-0 items-center gap-2">
                  <OrgAvatar org={org} size="sm" />
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--text)' }}
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
            </div>

            {/* Models for this org */}
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
