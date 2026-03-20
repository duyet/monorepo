import { createFileRoute } from "@tanstack/react-router";
import type { PeriodDays } from "@/lib/periods";
import { DEFAULT_PERIOD, getPeriodDays } from "@/lib/periods";
import { CloudflareView, fetchCloudflareData } from "@/app/blog/cloudflare";
import { PostHogView, fetchPostHogData } from "@/app/blog/posthog";

const STATIC_DAYS: PeriodDays = getPeriodDays(DEFAULT_PERIOD) as PeriodDays;

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const days = STATIC_DAYS;
    const [cloudflare, posthog] = await Promise.allSettled([
      fetchCloudflareData(days),
      fetchPostHogData(days),
    ]);

    return {
      days,
      cloudflare:
        cloudflare.status === "fulfilled"
          ? cloudflare.value
          : null,
      posthog:
        posthog.status === "fulfilled"
          ? posthog.value
          : null,
    };
  },
  head: () => ({
    meta: [
      { title: "Blog Insights" },
      {
        name: "description",
        content: "Blog Insights data collected from Cloudflare and PostHog.",
      },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { cloudflare, posthog } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Blog Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Traffic and behavior insights from Cloudflare and PostHog
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
