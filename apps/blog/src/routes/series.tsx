import type { Series } from "@duyet/interfaces";
import { cn } from "@duyet/libs";
import { getAllSeries } from "@duyet/libs/getSeries";
import { createFileRoute } from "@tanstack/react-router";
import { SeriesBox } from "@/components/layout";

export const Route = createFileRoute("/series")({
  head: () => ({
    meta: [
      { title: "Series | Tôi là Duyệt" },
      { name: "description", content: "Blog post series." },
    ],
  }),
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
  const seriesList: Series[] = getAllSeries();

  return (
    <div className="mb-0 mt-10 grid grid-cols-1 gap-8 md:grid-cols-1">
      {seriesList.map((series: Series, index: number) => (
        <SeriesBox
          className={cn(seriesBackgrounds[index % seriesBackgrounds.length])}
          key={series.slug}
          series={series}
        />
      ))}
    </div>
  );
}
