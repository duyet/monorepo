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
    <div className="space-y-10">
      <section className="pt-8 lg:pt-12">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-white">
              <Activity className="h-4 w-4 text-[#ff6a00]" />
              Snapshot dashboard
            </div>
            <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] sm:text-6xl lg:text-7xl">
              Homelab operating view.
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-[#4d4d4d] dark:text-[#cfcfc8]">
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

      <div className="border-t border-black/10 pt-5 dark:border-white/15">
        <p className="text-sm leading-6 text-[#686862] dark:text-[#b7b7aa]">
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
    <div className="rounded-xl bg-white p-4 text-[#1a1a1a] shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)] first:bg-[#cfe2f3] [&:nth-child(2)]:bg-[#b8efd2] [&:nth-child(3)]:bg-[#f6c5c7]">
      <div className="mb-8 flex h-9 w-9 items-center justify-center rounded-lg bg-black/10 text-[#1a1a1a]">
        {icon}
      </div>
      <div className="text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-black/60">{label}</div>
    </div>
  );
}
