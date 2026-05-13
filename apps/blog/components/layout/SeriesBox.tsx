import type { Series } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";

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
        "border-y border-[var(--border-faint)] py-6 dark:border-white/10",
        className
      )}
    >
      <h2
        className={cn(
          "mb-6 text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] dark:text-[var(--on-dark)]"
        )}
      >
        Series:{" "}
        <a
          className="underline-offset-4 transition-colors hover:text-[var(--body)] hover:underline"
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
                "border-t border-[var(--border-faint)] py-4 transition-colors hover:bg-[var(--surface-soft)]",
                isCurrent && "bg-[var(--surface-soft)]"
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
                      "line-clamp-1 text-base font-medium text-[var(--body-strong)] transition-colors hover:text-[var(--body)] dark:text-[var(--on-dark-soft)] dark:hover:text-[var(--on-dark)]"
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
