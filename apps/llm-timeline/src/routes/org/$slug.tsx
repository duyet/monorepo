import { ogHeadLinks, ogMeta } from "@duyet/config/og";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageLayout } from "@/components/page-layout";
import { TimelinePage } from "@/components/timeline-page";
import { organizations } from "@/lib/data";
import { ogImageUrl } from "@/lib/og";
import { slugify } from "@/lib/utils";

export const Route = createFileRoute("/org/$slug")({
  beforeLoad: ({ params }) => {
    const org = organizations.find((o) => slugify(o) === params.slug);
    if (!org) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const org = organizations.find((o) => slugify(o) === params.slug);
    if (!org) return {};
    const canonicalUrl = `https://llm-timeline.duyet.net/org/${params.slug}`;
    const title = `${org} LLM Models | LLM Timeline`;
    const description = `A comprehensive timeline of Large Language Model releases from ${org}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        // ~1,448 of these pages exist and every one of them used to unfurl as a
        // text-only card. `generate-og.ts` writes the matching PNG in prebuild.
        ...ogMeta({
          url: canonicalUrl,
          title,
          description,
          image: ogImageUrl("org", params.slug),
        }),
      ],
      links: ogHeadLinks({ url: canonicalUrl }),
    };
  },
  component: OrgPage,
});

function OrgPage() {
  const { slug } = Route.useParams();
  const org = organizations.find((o) => slugify(o) === slug);

  if (!org) return null;

  return (
    <PageLayout description={`Timeline of Large Language Model releases from ${org}`}>
      <TimelinePage view="models" license="all" orgSlug={slug} />
    </PageLayout>
  );
}
