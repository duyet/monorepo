import { createFileRoute } from "@tanstack/react-router";
import { Activity, Server, Smartphone, Wifi } from "lucide-react";
import { DashboardTabs } from "@/components/DashboardTabs";
import { ClusterOverview } from "@/components/dashboard/ClusterOverview";
import { ClusterTopology } from "@/components/dashboard/ClusterTopology";
import { NetworkStats } from "@/components/dashboard/NetworkStats";
import { ResourceMetrics } from "@/components/dashboard/ResourceMetrics";
import { ServiceDowntime } from "@/components/dashboard/ServiceDowntime";
import { ServicesStatus } from "@/components/dashboard/ServicesStatus";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SmartDevicesOverview } from "@/components/smart-devices/SmartDevicesOverview";
import { useNodes, useServices, useSmartDevices } from "@/hooks/useDashboard";

// Baked in at build time — shows when the AI Agent last captured and committed
// the data snapshot.
const snapshotDate = new Date().toLocaleString();

export const Route = createFileRoute("/")({
  component: HomelabPage,
});

function HomelabPage() {
  const { onlineCount, totalNodes } = useNodes();
  const { runningServices, totalServices } = useServices();
  const { devices } = useSmartDevices();
  const onlineDevices = devices.filter((device) => device.status !== "offline");

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
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[#d9ead0] bg-[#eef8e8] px-3 py-1 text-xs font-medium text-neutral-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              <Activity className="h-3.5 w-3.5" />
              Snapshot dashboard
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-foreground sm:text-4xl">
              Homelab
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-muted-foreground">
              Cluster health, running services, network throughput, and smart
              home devices in one operational view.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
            <SummaryMetric
              icon={<Server className="h-4 w-4" />}
              label="Nodes"
              value={`${onlineCount}/${totalNodes}`}
            />
            <SummaryMetric
              icon={<Wifi className="h-4 w-4" />}
              label="Services"
              value={`${runningServices}/${totalServices}`}
            />
            <SummaryMetric
              icon={<Smartphone className="h-4 w-4" />}
              label="Devices"
              value={`${onlineDevices.length}/${devices.length}`}
            />
          </div>
        </div>
      </section>

      <DashboardTabs
        infrastructure={infrastructure}
        smartDevices={smartDevices}
      />

      <div className="border-t border-border pt-4">
        <p className="text-xs text-neutral-500 dark:text-muted-foreground">
          This is not a realtime dashboard. Data is captured by AI Agent and
          committed directly to source code. Snapshot taken at {snapshotDate}.
        </p>
      </div>
    </div>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary p-3">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-card text-neutral-700 shadow-sm dark:text-foreground">
        {icon}
      </div>
      <div className="text-lg font-semibold tabular-nums text-neutral-950 dark:text-foreground">
        {value}
      </div>
      <div className="text-xs text-neutral-500 dark:text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
