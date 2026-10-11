import type { Series } from "@duyet/interfaces";
import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
import { getAllSeries } from "@/lib/posts";

export const Route = createFileRoute("/series")({
  head: () => ({
    meta: [
      { title: "Series | Tôi là Duyệt" },
      { name: "description", content: "Blog post series." },
    ],
  }),
  loader: async () => {
    const seriesList = await getAllSeries();
    return { seriesList };
  },
  component: SeriesPage,
});

function SeriesPage(): ReactElement {
  const hasChild = useMatches().some(
    (match) => match.routeId === "/series/$slug"
  );
  const { seriesList } = Route.useLoaderData() as { seriesList: Series[] };
  if (hasChild) return <Outlet />;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <header className="pt-24 md:pt-28 pb-10 mx-auto">
        <h1 className="text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.018em] text-foreground m-0">
          Series
        </h1>
        <p className="mt-4 text-base leading-[1.6] text-muted-foreground max-w-xl">
          Posts grouped by subject.
        </p>
      </header>

      <div
        className="mb-16 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2"
        aria-label="All series"
      >
        {seriesList.map((series, i) => {
          const latest = series.posts[0];
          const count = series.posts.length;
          const style: CSSProperties = {
            animationDelay: `${Math.min(i, 12) * 40}ms`,
          };
          return (
            <Link
              key={series.slug}
              to="/series/$slug/"
              params={{ slug: series.slug }}
              className="editorial-enter group block bg-background px-5 py-5 no-underline text-inherit transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
              style={style}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="m-0 min-w-0 text-base font-semibold leading-tight tracking-[-0.01em] text-foreground">
                  {series.name}
                </h2>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {count} {count === 1 ? "post" : "posts"}
                </span>
              </div>
              {latest && (
                <p className="mt-2 truncate text-sm leading-[1.55] text-muted-foreground">
                  {latest.title}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
