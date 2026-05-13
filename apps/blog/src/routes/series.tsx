import type { Series } from "@duyet/interfaces";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { SeriesBox } from "@/components/layout";
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

function SeriesPage() {
  const hasChild = useMatches().some((m) => m.id === "/series/$slug");
  if (hasChild) return <Outlet />;

  const { seriesList } = Route.useLoaderData() as { seriesList: Series[] };

  return (
    <div className="min-h-screen bg-[var(--background-primary)] px-5 pb-14 sm:px-8 lg:px-10">
      <div className="mx-auto mb-10 max-w-[1180px]">
        <div className="max-w-3xl">
          <div className="blog-page-head">
            <h1>Series</h1>
            <p>
              Longer threads and linked notes grouped into focused reading
              paths.
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5">
        {seriesList.map((series: Series) => (
          <SeriesBox
            key={series.slug}
            series={series}
            tone="light"
            className="bg-white shadow-none"
          />
        ))}
      </div>
    </div>
  );
}
