import type { Series } from '@duyet/interfaces'
import { cn } from '@duyet/libs/utils'
import { NewspaperIcon } from 'lucide-react'
import Link from 'next/link'

export function SeriesBox({
  series,
  current,
  className,
}: {
  series: Series | null
  current?: string
  className?: string
}) {
  if (!series) return null
  const { name, posts } = series

  return (
    <div
      className={cn(
        'rounded-3xl bg-oat p-8 md:p-12',
        className,
      )}
    >
      <h2 className="mb-8 flex flex-row items-center gap-3 font-serif text-2xl font-bold text-neutral-900 md:text-3xl">
        <NewspaperIcon size={28} strokeWidth={2} />
        Series:{' '}
        <Link
          className="underline-offset-4 hover:underline"
          href={`/series/${series.slug}`}
        >
          {name}
        </Link>
      </h2>

      <div className="grid grid-cols-1 gap-2">
        {posts.map(({ slug, title, excerpt }, i) => {
          const isCurrent = current === slug
          return (
            <div
              className={cn(
                'flex items-center gap-6 rounded-2xl p-4 transition-all',
                isCurrent ? 'bg-white' : '',
              )}
              key={slug}
            >
              <div
                className={cn(
                  'text-5xl font-bold md:text-6xl font-serif',
                  isCurrent ? 'text-neutral-900' : 'text-neutral-900',
                )}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                {isCurrent ? (
                  <span className="line-clamp-1 text-lg font-semibold text-neutral-900">
                    {title}
                  </span>
                ) : (
                  <Link
                    className="line-clamp-1 text-lg font-medium text-neutral-800 transition-colors hover:text-neutral-900 hover:underline hover:underline-offset-4"
                    href={slug}
                  >
                    {title}
                  </Link>
                )}

                <p
                  className={cn(
                    'line-clamp-1 text-sm',
                    isCurrent ? 'text-neutral-700' : 'text-neutral-600',
                  )}
                >
                  {excerpt}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
