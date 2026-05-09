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
        "rounded-lg border border-[var(--hairline)] bg-[var(--surface-card)] p-8 dark:bg-[var(--surface-card)]",
        isDarkTone && "border-white/15 bg-[var(--surface-dark)] text-[var(--on-dark)]",
        className
      )}
    >
      <h2
        className={cn(
          "mb-6 flex flex-row items-center gap-3 font-serif text-2xl tracking-[-0.3px] text-[var(--ink)] dark:text-[var(--on-dark)] md:text-3xl"
        )}
      >
        <NewspaperIcon size={24} strokeWidth={1.5} className="text-[var(--muted)]" />
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
                "rounded-md p-4 transition-colors",
                isCurrent
                  ? isDarkTone
                    ? "bg-white/12"
                    : "bg-[var(--background-primary)] dark:bg-[var(--surface-dark-soft)]"
                  : "hover:bg-[var(--background-primary)]/50 dark:hover:bg-[var(--surface-dark-soft)]/50"
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
