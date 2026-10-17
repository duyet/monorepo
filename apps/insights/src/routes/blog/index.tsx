import { createFileRoute } from "@tanstack/react-router";
import { ogMeta } from "@duyet/config/og";
import { SITE_OG_IMAGE, SITE_URL } from "@/lib/site";
import { CloudflareView, fetchCloudflareData } from "@/app/blog/cloudflare";
import { fetchPostHogData, PostHogView } from "@/app/blog/posthog";
import type { PeriodDays } from "@/lib/periods";
import { DEFAULT_PERIOD, getPeriodDays } from "@/lib/periods";
import {
  InsightsPageHeader,
  InsightsSection,
} from "@/components/layouts/InsightsPageShell";

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
      cloudflare: cloudflare.status === "fulfilled" ? cloudflare.value : null,
      posthog: posthog.status === "fulfilled" ? posthog.value : null,
    };
  },
  head: () => {
    const title = "Blog Insights";
    const description =
      "Blog Insights data collected from Cloudflare and PostHog.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...ogMeta({
          url: `${SITE_URL}/blog`,
          title,
          description,
          image: SITE_OG_IMAGE,
        }),
      ],
    };
  },
  component: BlogPage,
});

function BlogPage() {
  const { cloudflare, posthog } = Route.useLoaderData();

  return (
    <div>
      <InsightsPageHeader
        badge="Blog"
        title="Who came by, and what they read."
        description="Traffic and reader behavior from Cloudflare and PostHog."
      />

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
