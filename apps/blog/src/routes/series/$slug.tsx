import type { Series } from "@duyet/interfaces";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeriesBox } from "@/components/layout";
import { getAllSeries, getSeries } from "@/lib/posts";

export const Route = createFileRoute("/series/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} Series | Tôi là Duyệt` }],
  }),
  loader: async ({ params }) => {
    const [allSeries, series] = await Promise.all([
      getAllSeries(),
      getSeries({ slug: params.slug }),
    ]);
    const found = allSeries.some((s) => s.slug === params.slug);
    if (!found) throw notFound();
    return { series };
  },
  component: SeriesDetailPage,
});

function SeriesDetailPage() {
  const { series } = Route.useLoaderData() as { series: Series | null };

  if (!series) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">Series not found.</p>
      </div>
    );
  }

  return <SeriesBox className="mt-0 border-0 pb-10 pt-10" series={series} />;
}
