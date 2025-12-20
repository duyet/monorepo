import type { PeriodDays } from "@/lib/periods";
import {
  generatePeriodStaticParams,
  getPeriodConfig,
  getPeriodDays,
} from "@/lib/periods";
import { Suspense } from "react";
import { SkeletonCard } from "../../../components/SkeletonCard";
import { Cloudflare } from "../cloudflare";
import { PostHog } from "../posthog";

export const dynamic = "force-static";

// Generate static pages for all time periods
export function generateStaticParams() {
  return generatePeriodStaticParams();
}

interface PageProps {
  params: Promise<{
    period: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { period } = await params;
  const config = getPeriodConfig(period);

  return {
    title: `Blog Insights - ${config.label}`,
    description: `Blog insights for the last ${config.label}`,
  };
}

export default async function BlogPeriodPage({ params }: PageProps) {
  const { period } = await params;
  const days = getPeriodDays(period) as PeriodDays;

  return (
    <>
      <Suspense fallback={<SkeletonCard />}>
        <Cloudflare days={days} />
      </Suspense>
      <Suspense fallback={<SkeletonCard />}>
        <PostHog days={days} />
      </Suspense>
    </>
  );
}
