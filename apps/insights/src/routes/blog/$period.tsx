import { createFileRoute } from "@tanstack/react-router";
import { CloudflareView, fetchCloudflareData } from "@/app/blog/cloudflare";
import { fetchPostHogData, PostHogView } from "@/app/blog/posthog";
import type { PeriodDays } from "@/lib/periods";
import { getPeriodConfig, getPeriodDays } from "@/lib/periods";
import { PeriodSwitcher } from "@/components/PeriodSwitcher";
import {
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";

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
    <div>
      <InsightsPageHeader
        badge={`Blog · ${config?.label ?? "Period"}`}
        title="Who came by, and what they read."
        description="Traffic and behavior insights from Cloudflare and PostHog."
      />

      <div className="mb-12">
        <PeriodSwitcher
          current={config?.value ?? "30"}
          route="/blog/$period"
          eyebrow="Period"
        />
      </div>

      <div>
        {cloudflare && (
          <InsightsSection
            title="Traffic analytics"
            description="CDN traffic and performance data."
          >
            <CloudflareView {...cloudflare} />
          </InsightsSection>
        )}

        {posthog && posthog.paths.length > 0 && (
          <InsightsSection
            title="User analytics"
            description="Popular content and visitor behavior."
          >
            <PostHogView {...posthog} />
          </InsightsSection>
        )}
      </div>
    </div>
  );
}
