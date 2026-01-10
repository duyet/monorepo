import { getAllSeries, getSeries } from "@duyet/libs/getSeries";
import { notFound } from "next/navigation";
import { SeriesBox } from "@/components/layout";

export const dynamic = "force-static";
export const dynamicParams = false;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const allSeries = getAllSeries();
  return allSeries.map((series) => ({
    slug: series.slug,
  }));
}

export default async function SeriesPage({ params }: PageProps) {
  const { slug } = await params;
  const series = getSeries({ slug });

  if (!series) {
    return notFound();
  }

  return <SeriesBox className="mt-0 border-0 pb-10 pt-10" series={series} />;
}
