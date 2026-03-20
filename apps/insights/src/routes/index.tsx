import { createFileRoute } from "@tanstack/react-router";
import { getCCUsageMetrics } from "@/app/ai/utils";
import { getWakaTimeMetrics } from "@/app/wakatime/wakatime-utils";
import { OverviewDashboard } from "@/components/dashboard/OverviewDashboard";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [aiMetrics, wakaTimeMetrics] = await Promise.allSettled([
      getCCUsageMetrics(30),
      getWakaTimeMetrics(30),
    ]);

    return {
      aiMetrics:
        aiMetrics.status === "fulfilled" ? aiMetrics.value : null,
      wakaTimeMetrics:
        wakaTimeMetrics.status === "fulfilled" ? wakaTimeMetrics.value : null,
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

  return <OverviewDashboard aiMetrics={aiMetrics} wakaTimeMetrics={wakaTimeMetrics} />;
}
