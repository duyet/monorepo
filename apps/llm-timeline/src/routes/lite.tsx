import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/page-layout";
import { TimelinePage } from "@/components/timeline-page";

export const Route = createFileRoute("/lite")({
  head: () => ({
    meta: [
      { title: "LLM Timeline (Lite Mode) | LLM Timeline" },
      { name: "description", content: "A streamlined, minimalist view of Large Language Model releases." },
    ],
  }),
  component: LitePage,
});

function LitePage() {
  return (
    <PageLayout description="A streamlined, minimalist view of Large Language Model releases">
      <TimelinePage view="models" license="all" liteMode={true} />
    </PageLayout>
  );
}
