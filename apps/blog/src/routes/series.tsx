import type { Series } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
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

const seriesBackgrounds = [
  "bg-[#eef4ff] dark:bg-[#1a2a3f]",
  "bg-[#edf7f1] dark:bg-[#164634]",
  "bg-[#fff4e8] dark:bg-[#3f2f1f]",
  "bg-[#f3efff] dark:bg-[#2f1f3f]",
  "bg-[#ffeef0] dark:bg-[#4f1f1f]",
  "bg-[#ecf7f7] dark:bg-[#1f3f3f]",
  "bg-[#f7f1e8] dark:bg-[#3f2f1f]",
];

function SeriesPage() {
  const hasChild = useMatches().some((m) => m.id === "/series/$slug");
  if (hasChild) return <Outlet />;

  const { seriesList } = Route.useLoaderData() as { seriesList: Series[] };

  return (
    <div className="min-h-screen bg-white px-5 pb-14 pt-10 dark:bg-[#0d0e0c] sm:px-8 sm:pt-14 lg:px-10 lg:pt-20">
      <div className="mx-auto mb-10 max-w-[1280px]">
        <div className="max-w-3xl">
          <h1 className="mb-5 text-4xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] sm:text-5xl lg:text-6xl">
            Series
          </h1>
          <p className="max-w-2xl text-sm font-medium leading-6 text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70 sm:text-base">
            Longer threads and linked notes grouped into focused reading paths.
          </p>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5">
        {seriesList.map((series: Series, index: number) => {
          const bgClass = seriesBackgrounds[index % seriesBackgrounds.length];

          return (
            <SeriesBox
              className={cn(bgClass)}
              key={series.slug}
              series={series}
              tone="light"
            />
          );
        })}
      </div>
    </div>
  );
}
