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
        "rounded-xl border border-[#1a1a1a]/10 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a] sm:p-8",
        isDarkTone && "border-white/15 bg-[#0f172a] text-white dark:bg-[#0f172a]",
        className
      )}
    >
      <h2
        className={cn(
          "mb-6 flex flex-row items-center gap-3 text-2xl font-semibold tracking-tight md:text-3xl",
          isDarkTone ? "text-white" : "text-[#1a1a1a] dark:text-[#f8f8f2]"
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
                    : "bg-white dark:bg-[#0d0e0c]"
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
                        ? "text-white"
                        : "text-[#1a1a1a] dark:text-[#f8f8f2]"
                    )}
                  >
                    {title}
                  </span>
                ) : (
                  <a
                    className={cn(
                      "line-clamp-1 text-base font-medium transition-colors hover:underline hover:underline-offset-4",
                      isDarkTone
                        ? "text-white/80 hover:text-white"
                        : "text-[#1a1a1a]/80 hover:text-[#1a1a1a] dark:text-[#f8f8f2]/80 dark:hover:text-[#f8f8f2]"
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
                        ? "text-white/74"
                        : "text-white/62"
                      : isCurrent
                        ? "text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70"
                        : "text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55"
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
