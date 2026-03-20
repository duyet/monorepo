import { getAllSeries, getSeries } from "@duyet/libs/getSeries";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeriesBox } from "@/components/layout";

export const Route = createFileRoute("/series/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} Series | Tôi là Duyệt` },
    ],
  }),
  beforeLoad: ({ params }) => {
    const allSeries = getAllSeries();
    const found = allSeries.some((s) => s.slug === params.slug);
    if (!found) throw notFound();
  },
  component: SeriesDetailPage,
});

function SeriesDetailPage() {
  const { slug } = Route.useParams();
  const series = getSeries({ slug });

  if (!series) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-neutral-600">Series not found.</p>
      </div>
    );
  }

  return <SeriesBox className="mt-0 border-0 pb-10 pt-10" series={series} />;
}
