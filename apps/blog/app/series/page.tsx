import type { Series } from "@duyet/interfaces";
import { cn } from "@duyet/libs";
import { getAllSeries } from "@duyet/libs/getSeries";
import { SeriesBox } from "../../components/series";

const seriesBackgrounds = [
  "bg-oat",
  "bg-sage",
  "bg-lavender",
  "bg-cactus-light",
  "bg-ivory-medium",
];

export default function SeriesPage() {
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
