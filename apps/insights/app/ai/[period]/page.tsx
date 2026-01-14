import { Suspense } from "react";
import {
  generatePeriodStaticParams,
  getPeriodConfig,
  getPeriodDays,
} from "@/lib/periods";
import { SkeletonCard } from "../../../components/SkeletonCard";
import { CCUsageActivity } from "../activity";
import { CCUsageCosts } from "../costs";
import { CCUsageDailyTable } from "../daily-table";
import { CCUsageErrorBoundary } from "../error-boundary";
import { CCUsageMetrics } from "../metrics";
import { CCUsageModels } from "../models";
import type { DateRangeDays } from "../types";

export const dynamic = "force-static";

// Generate static pages for all time periods
export function generateStaticParams() {
  return generatePeriodStaticParams();
}

const SECTION_CONFIGS = [
  {
    id: "metrics",
    title: "Usage Overview",
    component: CCUsageMetrics,
  },
  {
    id: "activity",
    title: "Daily Activity",
    component: CCUsageActivity,
  },
  {
    id: "models",
    title: "AI Model Usage",
    component: CCUsageModels,
  },
  {
    id: "costs",
    title: "Daily Costs",
    component: CCUsageCosts,
  },
  {
    id: "daily-table",
    title: "Daily Usage Detail",
    component: CCUsageDailyTable,
  },
] as const;

interface PageProps {
  params: Promise<{
    period: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { period } = await params;
  const config = getPeriodConfig(period);

  return {
    title: `AI Usage Analytics - ${config.label}`,
    description: `AI usage analytics for the last ${config.label}`,
  };
}

export default async function AIUsagePeriodPage({ params }: PageProps) {
  const { period } = await params;
  const config = getPeriodConfig(period);
  const days = getPeriodDays(period) as DateRangeDays;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          AI Usage Analytics
        </h1>
        <p className="mt-1 text-muted-foreground">
          Claude Code usage patterns, token consumption, and model insights
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Claude Code current subscription $100
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {SECTION_CONFIGS.map((section) => {
          const Component = section.component;

          // Dynamic title for daily-table section based on date range
          const isMonthlyView =
            section.id === "daily-table" && (days === 365 || days === "all");
          const sectionTitle = isMonthlyView
            ? "Monthly Usage Detail"
            : section.title;
          const description = `${sectionTitle} for the last ${config.label}`;

          return (
            <section key={section.id} className="space-y-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{sectionTitle}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <CCUsageErrorBoundary>
                <Suspense fallback={<SkeletonCard />}>
                  <Component days={days} />
                </Suspense>
              </CCUsageErrorBoundary>
            </section>
          );
        })}

        <p className="text-xs text-muted-foreground">
          Claude Code Usage Analytics
        </p>
      </div>
    </div>
  );
}
