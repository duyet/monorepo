import { notFound } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import { TimelinePage } from "@/components/timeline-page";
import { organizations } from "@/lib/data";
import { slugify } from "@/lib/utils";

export async function generateStaticParams() {
  return organizations.map((o) => ({ slug: slugify(o) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Find the org name by matching slug
  const org = organizations.find((o) => slugify(o) === slug);

  if (!org) {
    return {};
  }

  return {
    title: `${org} LLM Models | LLM Timeline`,
    description: `A comprehensive timeline of Large Language Model releases from ${org}.`,
    alternates: {
      canonical: `https://llm-timeline.duyet.net/org/${slug}`,
    },
  };
}

export default async function OrgPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Validate the slug exists
  const org = organizations.find((o) => slugify(o) === slug);
  if (!org) {
    notFound();
  }

  return (
    <PageLayout
      title={`${org} LLM Models`}
      description={`Timeline of Large Language Model releases from ${org}`}
    >
      <TimelinePage view="models" license="all" orgSlug={slug} />
    </PageLayout>
  );
}
