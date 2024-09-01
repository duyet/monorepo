import type { Series } from '@duyet/interfaces';
import { cn } from '@duyet/libs';
import { getAllSeries } from '@duyet/libs/getSeries';
import { SeriesBox } from '../../components/series';

export default function SeriesPage() {
  const seriesList: Series[] = getAllSeries();

  return (
    <div className="mb-0 mt-10 grid grid-cols-1 gap-8 md:grid-cols-1">
      {seriesList.map((series: Series, index: number) => (
        <SeriesBox
          className={cn(
            index % 2 === 1 ? 'bg-white' : 'bg-gold dark:bg-gray-900',
          )}
          key={series.slug}
          series={series}
        />
      ))}
    </div>
  );
}
