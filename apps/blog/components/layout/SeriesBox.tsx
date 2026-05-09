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
  const isDarkTone = tone === "dark";

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--hairline)] bg-[var(--background)] p-6 dark:border-white/10 dark:bg-[var(--surface-dark)] sm:p-8",
        isDarkTone && "border-white/15 bg-[var(--surface-dark)] text-[var(--on-dark)] dark:bg-[var(--surface-dark)]",
        className
      )}
    >
      <h2
        className={cn(
          "mb-6 flex flex-row items-center gap-3 text-2xl font-semibold tracking-tight md:text-3xl",
          isDarkTone ? "text-[var(--on-dark)]" : "text-[var(--foreground)] dark:text-[var(--on-dark)]"
        )}
      >
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
        {posts.map(({ slug, title, excerpt }) => {
          const isCurrent = current === slug;
          return (
            <div
              className={cn(
                "flex items-center gap-4 rounded-lg p-3 transition-colors sm:gap-5 sm:p-4",
                isCurrent
                  ? isDarkTone
                    ? "bg-white/12"
                    : "bg-[var(--background)] dark:bg-[var(--surface-dark-soft)]"
                  : ""
              )}
              key={slug}
            >
              <div className="flex-1">
                {isCurrent ? (
                  <span
                    className={cn(
                      "line-clamp-1 text-base font-semibold",
                      isDarkTone
                        ? "text-[var(--on-dark)]"
                        : "text-[var(--foreground)] dark:text-[var(--on-dark)]"
                    )}
                  >
                    {title}
                  </span>
                ) : (
                  <a
                    className={cn(
                      "line-clamp-1 text-base font-medium transition-colors hover:underline hover:underline-offset-4",
                      isDarkTone
                        ? "text-[var(--on-dark-soft)] hover:text-[var(--on-dark)]"
                        : "text-[var(--body)] hover:text-[var(--foreground)] dark:text-[var(--on-dark-soft)] dark:hover:text-[var(--on-dark)]"
                    )}
                    href={slug}
                  >
                    {title}
                  </a>
                )}

                <p
                  className={cn(
                    "line-clamp-1 text-sm",
                    isDarkTone
                      ? isCurrent
                        ? "text-[var(--on-dark)]/74"
                        : "text-[var(--on-dark-soft)]"
                      : isCurrent
                        ? "text-[var(--body)]"
                        : "text-[var(--muted)]"
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
