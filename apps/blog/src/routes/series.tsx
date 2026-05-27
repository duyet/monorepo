import type { Series } from "@duyet/interfaces";
import { Card, CardContent } from "@duyet/components";
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
  if (hasChild) return <Outlet />;

  const { seriesList } = Route.useLoaderData() as { seriesList: Series[] };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">Reading paths</span>
        <h1 className="em-masthead__title">Series</h1>
        <p className="em-masthead__dek">
          Longer threads and linked notes grouped into focused reading paths.
        </p>
      </header>

      <div
        className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
        aria-label="All series"
      >
        {seriesList.map((series, i) => {
          const style: CSSProperties = {
            animationDelay: `${Math.min(i, 12) * 40}ms`,
          };
          return (
            <Link
              key={series.slug}
              to="/series/$slug/"
              params={{ slug: series.slug }}
              className="editorial-enter group block bg-background transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
              style={style}
            >
              <Card className="h-full rounded-none border-0 bg-transparent">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Series
                  </span>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {series.name}
                  </h3>
                  <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
                    <span className="font-mono tabular-nums">
                      {String(series.posts.length).padStart(2, "0")}{" "}
                      {series.posts.length === 1 ? "post" : "posts"}
                    </span>
                    <span className="opacity-60 transition-opacity group-hover:opacity-100">
                      →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
