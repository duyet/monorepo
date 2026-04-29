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
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Activity className="h-3.5 w-3.5" />
              Snapshot dashboard
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">
              Homelab
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              Cluster health, running services, network throughput, and smart
              home devices in one operational view.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
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

      <div className="border-t pt-4">
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
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
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-neutral-700 shadow-sm dark:bg-neutral-950 dark:text-neutral-200">
        {icon}
      </div>
      <div className="text-lg font-semibold tabular-nums text-neutral-950 dark:text-neutral-50">
        {value}
      </div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </div>
    </div>
  );
}
