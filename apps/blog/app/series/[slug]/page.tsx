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

  return <SeriesBox className="mt-0 border-0 pb-10 pt-10" series={series} />;
}
