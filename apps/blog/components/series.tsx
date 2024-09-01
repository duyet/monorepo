import type { Series } from '@duyet/interfaces';
import { cn } from '@duyet/libs/utils';
import { NewspaperIcon } from 'lucide-react';
import Link from 'next/link';

export function SeriesBox({
  series,
  current,
  className,
}: {
  series: Series | null;
  current?: string;
  className?: string;
}) {
  if (!series) return null;
  const { name, posts } = series;

  return (
    <div
      className={cn(
        'rounded-lg border border-gold bg-card bg-gold text-card-foreground',
        'dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      <div className="overflow-hidden dark:bg-gray-900">
        <div className="p-6 md:p-8">
          <h2 className="text-gradient-to-r mb-4 flex flex-row items-center gap-2 from-green-400 to-blue-500 text-2xl font-bold">
            <NewspaperIcon size={24} strokeWidth={1} />
            Series:{' '}
            <Link
              className="underline-offset-8 hover:underline"
              href={`/series/${series.slug}`}
            >
              {name}
            </Link>
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {posts.map(({ slug, title, excerpt }, i) => {
              return (
                <div
                  className={cn(
                    'flex items-center justify-between',
                    current === slug ? 'text-black dark:text-white' : '',
                  )}
                  key={slug}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        'text-6xl font-bold text-gray-600 dark:text-gray-600',
                        current === slug && 'text-gray-950 dark:text-gray-300',
                      )}
                    >
                      {i + 1}
                    </div>
                    <div>
                      {current === slug ? (
                        <span className="text-black-950 line-clamp-1 text-lg font-medium">
                          {title}
                        </span>
                      ) : (
                        <Link
                          className="text-black-900 line-clamp-1 text-lg font-medium hover:underline"
                          href={slug}
                        >
                          {title}
                        </Link>
                      )}

                      <p
                        className={cn(
                          'line-clamp-1 text-sm text-gray-600 dark:text-gray-400',
                          current === slug && 'dark:text-gray-300',
                        )}
                      >
                        {excerpt}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
