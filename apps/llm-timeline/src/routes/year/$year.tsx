import { ogHeadLinks, ogMeta } from "@duyet/config/og";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageLayout } from "@/components/page-layout";
import { TimelinePage } from "@/components/timeline-page";
import { years } from "@/lib/data";
import { ogImageUrl } from "@/lib/og";

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
    const title = `LLM Models Released in ${year} | LLM Timeline`;
    const description = `A comprehensive timeline of Large Language Model releases from ${year}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...ogMeta({
          url: canonicalUrl,
          title,
          description,
          image: ogImageUrl("year", year),
        }),
      ],
      links: ogHeadLinks({ url: canonicalUrl }),
    };
  },
  component: YearPage,
});

function YearPage() {
  const { year } = Route.useParams();
  const yearNum = parseInt(year, 10);

  return (
    <PageLayout description={`Timeline of Large Language Model releases from ${year}`}>
      <TimelinePage view="models" license="all" year={yearNum} />
    </PageLayout>
  );
}
