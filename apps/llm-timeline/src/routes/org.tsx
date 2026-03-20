import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
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
            className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
          >
            {org}
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
