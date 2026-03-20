import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageLayout } from "@/components/page-layout";
import { TimelinePage } from "@/components/timeline-page";
import { years } from "@/lib/data";

export const Route = createFileRoute("/year/$year")({
  beforeLoad: ({ params }) => {
    const yearNum = parseInt(params.year, 10);
    if (Number.isNaN(yearNum) || !years.includes(yearNum)) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const year = params.year;
    const yearNum = parseInt(year, 10);
    if (Number.isNaN(yearNum) || !years.includes(yearNum)) return {};
    return {
      meta: [
        { title: `LLM Models Released in ${year} | LLM Timeline` },
        {
          name: "description",
          content: `A comprehensive timeline of Large Language Model releases from ${year}.`,
        },
      ],
    };
  },
  component: YearPage,
});

function YearPage() {
  const { year } = Route.useParams();
  const yearNum = parseInt(year, 10);

  return (
    <PageLayout
      title={`LLM Models Released in ${year}`}
      description={`Timeline of Large Language Model releases from ${year}`}
    >
      <TimelinePage view="models" license="all" year={yearNum} />
    </PageLayout>
  );
}
