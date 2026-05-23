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
  if (hasChild) return <Outlet />;

  const { seriesList } = Route.useLoaderData() as { seriesList: Series[] };

  return (
    <div className="px-6 md:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">Reading paths</span>
        <h1 className="em-masthead__title">Series</h1>
        <p className="em-masthead__dek">
          Longer threads and linked notes grouped into focused reading paths.
        </p>
      </header>

      <div className="em-index">
        {seriesList.map((series, i) => {
          const style: CSSProperties = {
            animationDelay: `${Math.min(i, 12) * 40}ms`,
          };
          return (
            <Link
              key={series.slug}
              to="/series/$slug/"
              params={{ slug: series.slug }}
              className="em-index__row editorial-enter"
              style={style}
            >
              <span className="em-index__name">{series.name}</span>
              <span className="em-index__count">
                {series.posts.length}{" "}
                {series.posts.length === 1 ? "post" : "posts"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
