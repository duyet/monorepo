import Container from '@duyet/components/Container';
import type { Series } from '@duyet/interfaces';
import { getAllSeries } from '@duyet/libs/getSeries';
import { SeriesBox } from '../../components/series';

export default function SeriesPage() {
  const seriesList: Series[] = getAllSeries();

  return (
    <Container>
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        {seriesList.map((series: Series) => (
          <SeriesBox key={series.slug} series={series} />
        ))}
      </div>
    </Container>
  );
}
