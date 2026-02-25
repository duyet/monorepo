import { formatDate, getLicenseColor, getTypeColor } from '@/lib/utils'
import type { Model } from '@/lib/data'
import { cn } from '@duyet/libs/utils'

interface ModelCardProps {
  model: Model
  isLast?: boolean
}

export function ModelCard({ model, isLast }: ModelCardProps) {
  return (
    <div className="relative flex gap-4 pb-8">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 h-full w-0.5 bg-neutral-200 dark:bg-neutral-700" />
      )}

      {/* Timeline Dot */}
      <div
        className={cn(
          'relative z-10 mt-1.5 h-6 w-6 shrink-0 rounded-full border-2',
          model.type === 'milestone'
            ? 'border-terracotta bg-terracotta-light'
            : 'border-neutral-300 bg-white dark:bg-neutral-800'
        )}
      >
        {model.type === 'milestone' && (
          <div className="absolute inset-1 rounded-full bg-terracotta" />
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
          {/* Header */}
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {model.name}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {model.org} · {formatDate(model.date)}
              </p>
            </div>

            {/* Badges */}
            <div className="flex gap-2">
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-xs font-medium',
                  getTypeColor(model.type)
                )}
              >
                {model.type}
              </span>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
                  getLicenseColor(model.license)
                )}
              >
                {model.license}
              </span>
            </div>
          </div>

          {/* Parameters */}
          {model.params && (
            <p className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {model.params} parameters
            </p>
          )}

          {/* Description */}
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {model.desc}
          </p>
        </div>
      </div>
    </div>
  )
}
