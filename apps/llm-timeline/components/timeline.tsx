import { ModelCard } from './model-card'
import type { Model } from '@/lib/data'

interface TimelineProps {
  modelsByYear: Map<number, Model[]>
}

export function Timeline({ modelsByYear }: TimelineProps) {
  // Sort years descending (newest first)
  const sortedYears = Array.from(modelsByYear.keys()).sort((a, b) => b - a)

  if (sortedYears.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-800">
        <p className="text-neutral-500 dark:text-neutral-400">
          No models found matching your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sortedYears.map((year) => {
        const yearModels = modelsByYear.get(year) || []
        return (
          <div key={year} style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
            {/* Year Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 font-semibold text-white dark:bg-white dark:text-neutral-900">
                {year}
              </div>
              <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {yearModels.length} model{yearModels.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Models for this year */}
            <div className="ml-2">
              {yearModels.map((model, index) => (
                <ModelCard
                  key={`${model.date}-${model.name}`}
                  model={model}
                  isLast={index === yearModels.length - 1}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
