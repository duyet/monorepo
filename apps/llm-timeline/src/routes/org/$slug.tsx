import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageLayout } from "@/components/page-layout";
import { TimelinePage } from "@/components/timeline-page";
import { organizations } from "@/lib/data";
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
    return {
      meta: [
        { title: `${org} LLM Models | LLM Timeline` },
        { name: "description", content: `A comprehensive timeline of Large Language Model releases from ${org}.` },
      ],
    };
  },
  component: OrgPage,
});

function OrgPage() {
  const { slug } = Route.useParams();
  const org = organizations.find((o) => slugify(o) === slug);

  if (!org) return null;

  return (
    <PageLayout
      title={`${org} LLM Models`}
      description={`Timeline of Large Language Model releases from ${org}`}
    >
      <TimelinePage view="models" license="all" orgSlug={slug} />
    </PageLayout>
  );
}
