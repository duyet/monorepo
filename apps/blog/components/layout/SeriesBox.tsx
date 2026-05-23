import type { Series } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import "@/styles/post-reader.css";

export function SeriesBox({
  series,
  current,
  className,
  tone = "light",
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
    <aside
      aria-label={`Series: ${name}`}
      className={cn("series-block", className)}
    >
      <p className="series-label">Part of the series</p>

      {showTitle && (
        <h2 className="series-title">
          <a href={`/series/${series.slug}/`}>{name}</a>
        </h2>
      )}

      <ol>
        {posts.map(({ slug, title }) => {
          const isCurrent = current === slug;
          return (
            <li
              className={cn(isCurrent && "is-current")}
              key={slug}
              aria-current={isCurrent ? "page" : undefined}
            >
              {isCurrent ? (
                <span>{title}</span>
              ) : (
                <a href={`${slug}/`}>{title}</a>
              )}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
