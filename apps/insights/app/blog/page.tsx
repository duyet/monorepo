import { Suspense } from "react";
import type { PeriodDays } from "@/lib/periods";
import { DEFAULT_PERIOD, getPeriodDays } from "@/lib/periods";
import { SkeletonCard } from "../../components/SkeletonCard";
import { Cloudflare } from "./cloudflare";
import { PostHog } from "./posthog";

export const metadata = {
  title: "Blog Insights",
  description: "Blog Insights data collected from Cloudflare and PostHog.",
};

export const revalidate = 3600; // Revalidate every hour on Vercel (ISR)

const STATIC_DAYS: PeriodDays = getPeriodDays(DEFAULT_PERIOD) as PeriodDays;

export default function Page() {
  return (
    <>
      <Suspense fallback={<SkeletonCard />}>
        <Cloudflare days={STATIC_DAYS} />
      </Suspense>
      <Suspense fallback={<SkeletonCard />}>
        <PostHog days={STATIC_DAYS} />
      </Suspense>
    </>
  );
}
