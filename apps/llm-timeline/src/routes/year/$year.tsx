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
    const canonicalUrl = `https://llm-timeline.duyet.net/year/${year}`;
    return {
      meta: [
        { title: `LLM Models Released in ${year} | LLM Timeline` },
        {
          name: "description",
          content: `A comprehensive timeline of Large Language Model releases from ${year}.`,
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:title", content: `LLM Models Released in ${year} | LLM Timeline` },
        {
          property: "og:description",
          content: `A comprehensive timeline of Large Language Model releases from ${year}.`,
        },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
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
