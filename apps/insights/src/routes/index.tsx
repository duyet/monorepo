import { createFileRoute } from "@tanstack/react-router";
import { OverviewDashboard } from "@/components/dashboard/OverviewDashboard";

export const Route = createFileRoute("/")({
  loader: async () => {
    // Keep the root route deterministic for Cloudflare Pages prerendering.
    // Live metrics pages load their own data on their dedicated routes.
    return {
      aiMetrics: null,
      wakaTimeMetrics: null,
    };
  },
  head: () => ({
    meta: [
      { title: "@duyet Insights Dashboard" },
      {
        name: "description",
        content:
          "Analytics and insights for duyet.net - Web traffic, coding activity, and performance metrics.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const { aiMetrics, wakaTimeMetrics } = Route.useLoaderData();

  return (
    <OverviewDashboard
      aiMetrics={aiMetrics}
      wakaTimeMetrics={wakaTimeMetrics}
    />
  );
}
