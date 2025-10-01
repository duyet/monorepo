import type { Series } from '@duyet/interfaces'
import Link from 'next/link'

interface HomeCardsProps {
  seriesList: Series[]
  topTags: string[]
}

export function HomeCards({ seriesList, topTags }: HomeCardsProps) {
  return (
    <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Link
          href="/featured"
          className="bg-cactus-light group flex flex-col rounded-2xl p-6 transition-all hover:scale-[1.02]"
        >
          <h3 className="font-serif text-xl font-bold text-neutral-900">
            Featured Posts →
          </h3>
        </Link>

        <Link
          href="/tags"
          className="bg-ivory-medium group flex min-h-[140px] flex-col rounded-2xl p-6 transition-all hover:scale-[1.02]"
        >
          <h3 className="mb-3 font-serif text-xl font-bold text-neutral-900">
            Tags
          </h3>
          {topTags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-2">
              {topTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
      </div>

      <Link
        href="/series"
        className="bg-lavender group flex min-h-[140px] flex-col rounded-2xl p-6 transition-all hover:scale-[1.02]"
      >
        <h3 className="mb-2 font-serif text-xl font-bold text-neutral-900">
          Series
        </h3>
        <p className="mb-3 text-sm text-neutral-700">
          Deep dives into specific topics
        </p>
        {seriesList.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2">
            {seriesList.map((series) => (
              <span
                key={series.slug}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-800"
              >
                {series.name}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  )
}
