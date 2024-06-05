import Container from '@duyet/components/Container';
import { getSeries } from '@duyet/libs/getSeries';
import { notFound } from 'next/navigation';
import { SeriesBox } from '../../../components/series';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function SeriesPage({ params: { slug } }: PageProps) {
  const series = getSeries({ slug });

  if (!series) {
    return notFound();
  }

  return (
    <Container>
      <div className="mt-10">
        <SeriesBox series={series} />
      </div>
    </Container>
  );
}
