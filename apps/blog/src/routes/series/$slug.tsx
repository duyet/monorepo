import Container from "@duyet/components/Container";
import type { Series } from "@duyet/interfaces";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeriesBox } from "@/components/layout";
import { BackLink } from "@/components/ui/BackLink";
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
      <Container className="mx-auto max-w-[960px] px-5 py-12 text-center sm:px-8 lg:px-10">
        <p className="text-lg text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
          Series not found.
        </p>
      </Container>
    );
  }

  return (
    <Container className="mx-auto max-w-[960px] px-5 sm:px-8 lg:px-10">
      <header className="blog-page-head border-b border-[var(--border-faint)] pb-8">
        <div className="mb-4">
          <BackLink href="/series/" text="All Series" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] dark:text-[var(--on-dark)] sm:text-5xl">
          {series.name}
        </h1>
        <p className="mt-4 text-sm font-medium text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
          {series.posts.length} {series.posts.length === 1 ? "post" : "posts"}
        </p>
      </header>
      <SeriesBox
        className="mt-10 border-y-0 pb-10 pt-0"
        series={series}
        showTitle={false}
      />
    </Container>
  );
}
