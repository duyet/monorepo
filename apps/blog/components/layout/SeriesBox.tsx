import type { Series } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@duyet/components/ui/card";

const SERIES_TONES = [
  "bg-blue-50 dark:bg-blue-950/30",
  "bg-emerald-50 dark:bg-emerald-950/30",
  "bg-amber-50 dark:bg-amber-950/30",
  "bg-rose-50 dark:bg-rose-950/30",
  "bg-violet-50 dark:bg-violet-950/30",
  "bg-cyan-50 dark:bg-cyan-950/30",
  "bg-orange-50 dark:bg-orange-950/30",
  "bg-lime-50 dark:bg-lime-950/30",
  "bg-pink-50 dark:bg-pink-950/30",
  "bg-indigo-50 dark:bg-indigo-950/30",
  "bg-teal-50 dark:bg-teal-950/30",
  "bg-yellow-50 dark:bg-yellow-950/30",
  "bg-fuchsia-50 dark:bg-fuchsia-950/30",
  "bg-sky-50 dark:bg-sky-950/30",
  "bg-red-50 dark:bg-red-950/30",
  "bg-green-50 dark:bg-green-950/30",
  "bg-purple-50 dark:bg-purple-950/30",
  "bg-slate-50 dark:bg-slate-900/50",
  "bg-stone-50 dark:bg-stone-900/50",
  "bg-zinc-50 dark:bg-zinc-900/50",
];

function toneFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return SERIES_TONES[hash % SERIES_TONES.length];
}

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

  const toneClass = toneFor(series.slug || name);

  return (
    <Card
      aria-label={`Series: ${name}`}
      className={cn("mt-14", toneClass, className)}
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
