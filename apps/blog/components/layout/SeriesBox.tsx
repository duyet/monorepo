import type { Series } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import { NewspaperIcon } from "lucide-react";

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
        "rounded-xl border border-neutral-950/10 bg-[#f4f4ef] p-6 dark:border-white/10 dark:bg-[#1a1a1a] sm:p-8",
        className
      )}
    >
      <h2 className="mb-6 flex flex-row items-center gap-3 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-[#f8f8f2] md:text-3xl">
        <NewspaperIcon size={28} strokeWidth={2} />
        Series:{" "}
        <a
          className="underline-offset-4 hover:underline"
          href={`/series/${series.slug}`}
        >
          {name}
        </a>
      </h2>

      <div className="grid grid-cols-1 gap-2">
        {posts.map(({ slug, title, excerpt }, i) => {
          const isCurrent = current === slug;
          return (
            <div
              className={cn(
                "flex items-center gap-4 rounded-lg p-3 transition-colors sm:gap-5 sm:p-4",
                isCurrent ? "bg-white dark:bg-[#242420]" : "hover:bg-white/70 dark:hover:bg-white/5"
              )}
              key={slug}
            >
              <div
                className={cn(
                  "text-3xl font-semibold tabular-nums md:text-4xl",
                  "text-neutral-950 dark:text-[#f8f8f2]"
                )}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                {isCurrent ? (
                  <span className="line-clamp-1 text-base font-semibold text-neutral-950 dark:text-[#f8f8f2]">
                    {title}
                  </span>
                ) : (
                  <a
                    className="line-clamp-1 text-base font-medium text-neutral-800 transition-colors hover:text-neutral-950 hover:underline hover:underline-offset-4 dark:text-[#f8f8f2]/80 dark:hover:text-[#f8f8f2]"
                    href={slug}
                  >
                    {title}
                  </a>
                )}

                <p
                  className={cn(
                    "line-clamp-1 text-sm",
                    isCurrent
                      ? "text-neutral-700 dark:text-[#f8f8f2]/70"
                      : "text-neutral-600 dark:text-[#f8f8f2]/55"
                  )}
                >
                  {excerpt}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
