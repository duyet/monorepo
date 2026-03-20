import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/page-layout";
import { StaticView } from "@/components/static-view";
import { models, years } from "@/lib/data";
import { getStats } from "@/lib/utils";

const stats = getStats(models);
const firstYear = years[years.length - 1];
const latestYear = years[0];

export const Route = createFileRoute("/")({
  component: LLMTimelinePage,
});

function LLMTimelinePage() {
  return (
    <PageLayout
      description={`Interactive timeline of Large Language Model releases (${firstYear}–${latestYear})`}
    >
      <StaticView
        models={models}
        stats={{
          models: stats.models,
          organizations: stats.organizations,
        }}
        sourceStats={stats.sources}
        view="models"
        license="all"
      />
    </PageLayout>
  );
}
