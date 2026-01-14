import type { PeriodDays } from "@/lib/periods";
import {
  generatePeriodStaticParams,
  getPeriodConfig,
  getPeriodDays,
} from "@/lib/periods";
import Image from "next/image";
import { Suspense } from "react";
import { SkeletonCard } from "../../../components/SkeletonCard";
import { StaticCard } from "../../../components/StaticCard";
import { WakaTimeActivity } from "../activity";
import { WakaTimeLanguages } from "../languages";
import { WakaTimeMetrics } from "../metrics";

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
    title: `WakaTime Coding Analytics @duyet - ${config.label}`,
    description: `Programming activity for the last ${config.label}`,
  };
}

export default async function WakaTimePeriodPage({ params }: PageProps) {
  const { period } = await params;
  const config = getPeriodConfig(period);
  const days = getPeriodDays(period) as PeriodDays;
  const isAllTime = days === "all";

  // Dynamic section titles based on period
  const activityTitle = isAllTime ? "Monthly Activity" : "Daily Activity";
  const activityDescription = isAllTime
    ? "Coding all the time"
    : `Coding hours over the last ${config.label}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Coding Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Programming activity and language statistics from WakaTime •{" "}
          {config.label}
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Coding Metrics */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Coding Overview</h2>
            <p className="text-sm text-muted-foreground">
              Programming activity summary for the last {config.label}
            </p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <WakaTimeMetrics days={days} />
          </Suspense>
        </div>

        {/* Coding Activity */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{activityTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {activityDescription}
            </p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <WakaTimeActivity days={days} />
          </Suspense>
        </div>

        {/* Programming Languages */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Programming Languages</h2>
            <p className="text-sm text-muted-foreground">
              Language usage and distribution
            </p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <WakaTimeLanguages days={days} />
          </Suspense>
        </div>

        {/* Activity Calendar */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Yearly Activity</h2>
            <p className="text-sm text-muted-foreground">
              Annual coding activity heatmap
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <StaticCard
              extra={
                <Image
                  alt="Wakatime Badge"
                  className="mt-3"
                  height={30}
                  src="https://wakatime.com/badge/user/8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9.svg"
                  unoptimized
                  width={200}
                />
              }
              source="WakaTime (Last Year)"
              title="Coding Activity Heatmap"
              url={{
                light:
                  "https://wakatime.com/share/@duyet/bf2b1851-7d8f-4c32-9033-f0ac18362d9e.svg",
                dark: "https://wakatime.com/share/@duyet/b7b8389a-04ba-402f-9095-b1748a5be49c.svg",
              }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Data from WakaTime • Updated daily
        </p>
      </div>
    </div>
  );
}
