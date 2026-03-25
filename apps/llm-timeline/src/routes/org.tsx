import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/page-layout";
import { organizations } from "@/lib/data";
import { slugify } from "@/lib/utils";

export const Route = createFileRoute("/org")({
  component: OrgIndexPage,
});

function OrgIndexPage() {
  return (
    <PageLayout description="Browse LLM models by organization">
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
