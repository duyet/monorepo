import { createFileRoute } from "@tanstack/react-router";
import { Server, Smartphone, Wifi } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@duyet/components";
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
      <section className="pt-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Infrastructure
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Homelab
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cluster health, running services, and smart home devices.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-3">
          <StatCard
            icon={<Server className="h-4 w-4 text-muted-foreground" />}
            label="Nodes"
            value={`${onlineCount}/${totalNodes}`}
            description="online"
          />
          <StatCard
            icon={<Wifi className="h-4 w-4 text-muted-foreground" />}
            label="Services"
            value={`${runningServices}/${totalServices}`}
            description="running"
          />
          <StatCard
            icon={<Smartphone className="h-4 w-4 text-muted-foreground" />}
            label="Devices"
            value={`${onlineDevices.length}/${devices.length}`}
            description="online"
          />
        </div>
      </section>

      <DashboardTabs
        infrastructure={infrastructure}
        smartDevices={smartDevices}
      />

      <div className="border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Not a realtime dashboard. Data is captured by AI Agent and committed
          to source code. Snapshot taken at {snapshotDate}.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
