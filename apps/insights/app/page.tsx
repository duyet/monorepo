import { Suspense } from "react";
import { OverviewDashboard } from "@/components/dashboard/OverviewDashboard";
import { PageLoadingSkeleton } from "@/components/loading/EnhancedSkeletons";

export const metadata = {
  title: "@duyet Insights Dashboard",
  description:
    "Analytics and insights for duyet.net - Web traffic, coding activity, and performance metrics.",
};

export default function InsightsPage() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <OverviewDashboard />
    </Suspense>
  );
}
