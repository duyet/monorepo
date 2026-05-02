import type { Series } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import { createFileRoute } from "@tanstack/react-router";
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
  "bg-oat",
  "bg-sage",
  "bg-lavender",
  "bg-cactus-light",
  "bg-ivory-medium",
];

function SeriesPage() {
  const { seriesList } = Route.useLoaderData() as { seriesList: Series[] };

  return (
    <div className="min-h-screen bg-white pb-14 dark:bg-[#0d0e0c]">
      <div className="mb-12 max-w-3xl pt-8 sm:pt-12">
        <h1 className="mb-5 text-4xl font-semibold tracking-tight text-neutral-950 dark:text-[#f8f8f2] sm:text-5xl lg:text-6xl">
          Series
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-600 dark:text-[#f8f8f2]/70 sm:text-base">
          Longer threads and linked notes grouped into focused reading paths.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5">
        {seriesList.map((series: Series, index: number) => (
          <SeriesBox
            className={cn(seriesBackgrounds[index % seriesBackgrounds.length])}
            key={series.slug}
            series={series}
          />
        ))}
      </div>
    </div>
  );
}
