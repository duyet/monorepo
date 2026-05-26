import type { Series } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@duyet/components/ui/card";

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
    <Card
      aria-label={`Series: ${name}`}
      className={cn("mt-14", className)}
    >
      <CardHeader className="pb-3">
        <CardDescription>Part of the series</CardDescription>
        {showTitle && (
          <CardTitle className="text-xl">
            <a
              href={`/series/${series.slug}/`}
              className="underline underline-offset-4 decoration-border hover:decoration-foreground transition-[text-decoration-color]"
            >
              {name}
            </a>
          </CardTitle>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="list-none m-0 p-0 space-y-0.5">
          {posts.map(({ slug, title }, index) => {
            const isCurrent = current === slug;
            const num = String(index + 1).padStart(2, "0");
            return (
              <li
                key={slug}
                aria-current={isCurrent ? "page" : undefined}
                className="grid gap-x-1 py-1.5 text-sm leading-snug"
                style={{ gridTemplateColumns: "2.25rem 1fr" }}
              >
                <span className="text-xs text-muted-foreground tabular-nums pt-0.5">
                  {num}
                </span>
                {isCurrent ? (
                  <span className="font-semibold text-foreground">
                    {title}
                  </span>
                ) : (
                  <a
                    href={`${slug}/`}
                    className="text-muted-foreground no-underline hover:text-foreground transition-colors"
                  >
                    {title}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
