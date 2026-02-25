import { getLicenseColor, getTypeColor } from '@/lib/utils'
import type { Model } from '@/lib/data'
import { cn } from '@duyet/libs/utils'
import { OrgAvatar } from '@/components/org-avatar'

interface ModelCardProps {
  model: Model
  isLast?: boolean
}

function getAccentBorderColor(license: Model['license']): string {
  switch (license) {
    case 'open':
      return 'var(--accent)'
    case 'partial':
      return '#a855f7'
    case 'closed':
    default:
      return 'var(--border)'
  }
}

export function ModelCard({ model, isLast }: ModelCardProps) {
  return (
    <div className="relative flex gap-4 pb-6">
      {/* Timeline Line */}
      {!isLast && (
        <div
          className="absolute left-[11px] top-6 h-full w-px"
          style={{ backgroundColor: 'var(--border)' }}
        />
      )}

      {/* Timeline Dot — larger/accent for milestones */}
      <div
        className={cn(
          'relative z-10 mt-2 h-5 w-5 shrink-0 rounded-full border-2',
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
          borderLeftColor: getAccentBorderColor(model.license),
          borderLeftWidth: '3px',
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
          <div className="flex items-center gap-2">
            <OrgAvatar org={model.org} size="sm" />
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)' }}
              >
                {model.name}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {model.org}
              </p>
            </div>
          </div>

          {/* Date + params */}
          <div className="text-right">
            <div
              className="text-xs"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
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
