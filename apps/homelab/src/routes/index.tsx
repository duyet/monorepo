import { DashboardTabs } from "@/components/DashboardTabs";
import { ClusterOverview } from "@/components/dashboard/ClusterOverview";
import { ClusterTopology } from "@/components/dashboard/ClusterTopology";
import { NetworkStats } from "@/components/dashboard/NetworkStats";
import { ResourceMetrics } from "@/components/dashboard/ResourceMetrics";
import { ServiceDowntime } from "@/components/dashboard/ServiceDowntime";
import { ServicesStatus } from "@/components/dashboard/ServicesStatus";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SmartDevicesOverview } from "@/components/smart-devices/SmartDevicesOverview";
import { createFileRoute } from "@tanstack/react-router";

// Baked in at build time — shows when the AI Agent last captured and committed
// the data snapshot.
const snapshotDate = new Date().toLocaleString();

export const Route = createFileRoute("/")({
  component: HomelabPage,
});

function HomelabPage() {

  const infrastructure = (
    <div className="space-y-8">
      <ErrorBoundary>
        <ClusterTopology />
      </ErrorBoundary>
      <ErrorBoundary>
        <ClusterOverview />
      </ErrorBoundary>
      <ErrorBoundary>
        <ResourceMetrics />
      </ErrorBoundary>
      <ErrorBoundary>
        <ServicesStatus />
      </ErrorBoundary>
      <ErrorBoundary>
        <NetworkStats />
      </ErrorBoundary>
      <ErrorBoundary>
        <ServiceDowntime />
      </ErrorBoundary>
    </div>
  );

  const smartDevices = (
    <ErrorBoundary>
      <SmartDevicesOverview />
    </ErrorBoundary>
  );

  return (
    <div className="space-y-8">
      <DashboardTabs
        infrastructure={infrastructure}
        smartDevices={smartDevices}
      />

      <div className="border-t pt-4">
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          This is not a realtime dashboard. Data is captured by AI Agent and
          committed directly to source code. Snapshot taken at {snapshotDate}.
        </p>
      </div>
    </div>
  );
}
