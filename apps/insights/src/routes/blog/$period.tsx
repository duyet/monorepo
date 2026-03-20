import { createFileRoute } from "@tanstack/react-router";
import { CloudflareView, fetchCloudflareData } from "@/app/blog/cloudflare";
import { fetchPostHogData, PostHogView } from "@/app/blog/posthog";
import type { PeriodDays } from "@/lib/periods";
import { getPeriodConfig, getPeriodDays } from "@/lib/periods";

export const Route = createFileRoute("/blog/$period")({
  loader: async ({ params }) => {
    const { period } = params;
    const config = getPeriodConfig(period);
    const days = getPeriodDays(period) as PeriodDays;

    const [cloudflare, posthog] = await Promise.allSettled([
      fetchCloudflareData(days),
      fetchPostHogData(days),
    ]);

    return {
      days,
      config,
      cloudflare: cloudflare.status === "fulfilled" ? cloudflare.value : null,
      posthog: posthog.status === "fulfilled" ? posthog.value : null,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Blog Insights - ${loaderData?.config?.label ?? ""}`,
      },
      {
        name: "description",
        content:
          loaderData?.config?.days === "all"
            ? "All-time blog insights and analytics"
            : `Blog insights for the last ${loaderData?.config?.label}`,
      },
    ],
  }),
  component: BlogPeriodPage,
});

function BlogPeriodPage() {
  const { config, cloudflare, posthog } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Blog Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Traffic and behavior insights from Cloudflare and PostHog
          {config?.label ? ` • ${config.label}` : ""}
        </p>
      </div>

      <div className="space-y-8">
        {cloudflare && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Traffic Analytics</h2>
              <p className="text-sm text-muted-foreground">
                CDN traffic and performance data
              </p>
            </div>
            <CloudflareView {...cloudflare} />
          </div>
        )}

        {posthog && posthog.paths.length > 0 && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">User Analytics</h2>
              <p className="text-sm text-muted-foreground">
                Popular content and visitor behavior
              </p>
            </div>
            <PostHogView {...posthog} />
          </div>
        )}
      </div>
    </div>
  );
}
