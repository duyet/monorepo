import type { Series } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";

export function SeriesBox({
  series,
  current,
  className,
  tone,
  showTitle = true,
}: {
  series: Series | null;
  current?: string;
  className?: string;
  tone?: "light" | "dark";
  showTitle?: boolean;
}) {
  if (!series) return null;
  const { name, posts } = series;

  // Tone parameter kept for API compatibility with downstream consumers.
  void tone;

  return (
    <section
      aria-label={`Series: ${name}`}
      className={cn("mt-16 border-t pt-12", className)}
    >
      {showTitle && (
        <header className="mb-10">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Part of the series
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
            <a
              href={`/series/${series.slug}/`}
              className="hover:text-muted-foreground transition-colors"
            >
              {name}
            </a>
          </h2>
          {posts.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? "article" : "articles"} in
              this series.
            </p>
          )}
        </header>
      )}
      <ol className="list-none m-0 p-0 space-y-6">
        {posts.map(({ slug, title, excerpt }, index) => {
          const isCurrent = current === slug;
          const num = index + 1;
          return (
            <li
              key={slug}
              aria-current={isCurrent ? "page" : undefined}
              className="flex items-start gap-5"
            >
              <span
                className={cn(
                  "shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium tabular-nums",
                  isCurrent
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {num}
              </span>
              <div className="min-w-0 flex-1">
                {isCurrent ? (
                  <p className="text-base font-semibold tracking-tight">
                    {title}
                  </p>
                ) : (
                  <a
                    href={`${slug}/`}
                    className="text-base font-semibold tracking-tight hover:text-muted-foreground transition-colors"
                  >
                    {title}
                  </a>
                )}
                {excerpt && (
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {excerpt}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
