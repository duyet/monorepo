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
    <div className="min-h-screen bg-[var(--background-primary)] px-5 pb-14 pt-10 dark:bg-[#0d0e0c] sm:px-8 sm:pt-14 lg:px-10 lg:pt-20">
      <div className="mx-auto mb-10 max-w-[1280px]">
        <div className="max-w-3xl">
          <h1 className="mb-5 font-serif text-4xl tracking-[-0.5px] text-[var(--ink)] dark:text-[var(--on-dark)] sm:text-5xl lg:text-[56px] lg:tracking-[-1px]">
            Series
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-[var(--body)] dark:text-[var(--muted)] sm:text-base">
            Longer threads and linked notes grouped into focused reading paths.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5">
        {seriesList.map((series: Series) => (
          <SeriesBox
            key={series.slug}
            series={series}
            tone="light"
          />
        ))}
      </div>
    </div>
  );
}
