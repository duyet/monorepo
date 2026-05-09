import type { Series } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import { NewspaperIcon } from "lucide-react";

export function SeriesBox({
  series,
  current,
  className,
  tone = "light",
}: {
  series: Series | null;
  current?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  if (!series) return null;
  const { name, posts } = series;

  // Tone parameter kept for API compatibility with downstream consumers
  void tone;

  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--hairline)] p-8 dark:border-white/10",
        className
      )}
    >
      <h2
        className={cn(
          "mb-6 flex flex-row items-center gap-3 font-serif text-2xl tracking-[-0.3px] text-[var(--ink)] dark:text-[var(--on-dark)] md:text-3xl"
        )}
      >
        <NewspaperIcon size={24} strokeWidth={1.5} className="text-[var(--muted)] dark:text-[var(--on-dark-soft)]" />
        Series:{" "}
        <a
          className="underline-offset-4 hover:text-[var(--primary)] hover:underline transition-colors"
          href={`/series/${series.slug}`}
        >
          {name}
        </a>
      </h2>

      <div className="grid grid-cols-1 gap-3">
        {posts.map(({ slug, title, excerpt }) => {
          const isCurrent = current === slug;
          return (
            <div
              className={cn(
                "rounded-md bg-white/60 p-4 transition-colors dark:bg-black/20",
                isCurrent && "bg-white/80 dark:bg-black/30"
              )}
              key={slug}
            >
              <div className="flex-1">
                {isCurrent ? (
                  <span
                    className={cn(
                      "line-clamp-1 text-base font-medium text-[var(--ink)] dark:text-[var(--on-dark)]"
                    )}
                  >
                    {title}
                  </span>
                ) : (
                  <a
                    className={cn(
                      "line-clamp-1 text-base font-medium text-[var(--body-strong)] hover:text-[var(--primary)] transition-colors dark:text-[var(--on-dark-soft)] dark:hover:text-[var(--primary)]"
                    )}
                    href={slug}
                  >
                    {title}
                  </a>
                )}

                <p
                  className={cn(
                    "line-clamp-1 mt-1 text-sm text-[var(--muted)] dark:text-[var(--on-dark-soft)]"
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
