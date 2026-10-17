import { ogMeta } from "@duyet/config/og";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/page-layout";
import { organizations } from "@/lib/data";
import { ogImageUrl, SITE_TITLE, SITE_URL } from "@/lib/og";
import { slugify } from "@/lib/utils";

const DESCRIPTION = "Browse LLM models by organization";

export const Route = createFileRoute("/org")({
  head: () => {
    // No head() at all meant this index unfurled as the homepage. The org
    // index has no copy of its own, so it keeps the site title — what needs
    // fixing is `og:url`. No card is generated for /org, so it keeps the site
    // card (and `twitter:card` stays "summary_large_image").
    const canonicalUrl = `${SITE_URL}/org`;
    return {
      meta: [
        { title: SITE_TITLE },
        { name: "description", content: DESCRIPTION },
        ...ogMeta({
          url: canonicalUrl,
          title: SITE_TITLE,
          description: DESCRIPTION,
          image: ogImageUrl("index"),
        }),
      ],
    };
  },
  component: OrgIndexPage,
});

function OrgIndexPage() {
  return (
    <PageLayout description={DESCRIPTION}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {organizations.map((org) => (
          <Link
            key={org}
            to="/org/$slug"
            params={{ slug: slugify(org) }}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {org}
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
