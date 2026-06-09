import { createFileRoute } from "@tanstack/react-router";
import {
  NodesTile,
  ServicesTile,
  ClusterStatsTile,
  NetworkTile,
  SmartDevicesTile,
  AgentActionsTile,
  StatusDot,
} from "@/components/tiles";
import { ClusterOverview } from "@/components/dashboard/ClusterOverview";
import { ClusterTopology } from "@/components/dashboard/ClusterTopology";
import { K8sInfo } from "@/components/dashboard/K8sInfo";
import { NetworkStats } from "@/components/dashboard/NetworkStats";
import { ResourceMetrics } from "@/components/dashboard/ResourceMetrics";
import { ServiceDowntime } from "@/components/dashboard/ServiceDowntime";
import { ServicesStatus } from "@/components/dashboard/ServicesStatus";
import { SmartDevicesOverview } from "@/components/smart-devices/SmartDevicesOverview";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNodes } from "@/hooks/useDashboard";
import type { RootSearch } from "./__root";

const snapshotDate = new Date().toLocaleString();

export const Route = createFileRoute("/")({
  component: HomelabPage,
});

function HomelabPage() {
  const { onlineCount, totalNodes } = useNodes();
  const search = Route.useSearch() as RootSearch;
  const tab = search?.tab;

  return (
    <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(32px,4vw,56px)] pb-[clamp(56px,8vw,96px)]">
        {/* Page header */}
        <div className="mb-6">
          <div className="rd-eyebrow mb-3">
            <StatusDot status={onlineCount === totalNodes ? "online" : "degraded"} />
            Infrastructure · homelab.duyet.net
          </div>
          <h1 className="rd-display text-[clamp(2.2rem,5vw,3.4rem)] mt-0">
            Homelab
          </h1>
          <p className="rd-lead mt-[14px]">
            Cluster health, running services, and smart-home devices.
          </p>
        </div>

        {/* Tab content */}
        {!tab && <OverviewTab />}
        {tab === "infrastructure" && <InfrastructureTab />}
        {tab === "k8s" && <K8sTab />}
        {tab === "smart-devices" && <SmartDevicesTab />}

        {/* Footer note */}
        <div className="mt-8 pt-4 border-t border-[var(--rd-line)]">
          <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px]">
            Not a realtime dashboard. Data captured and auto driven by{" "}
            <span className="text-[var(--rd-accent)]">duyetbot-agent</span>.
            Snapshot taken at {snapshotDate}.
          </p>
        </div>
      </section>
    </div>
  );
}

/** Overview — compact bento grid */
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="md:col-span-2"><NodesTile /></div>
      <div className="md:col-span-1"><ClusterStatsTile /></div>
      <div className="md:col-span-2"><ServicesTile /></div>
      <div className="md:col-span-1"><NetworkTile /></div>
      <div className="md:col-span-1"><SmartDevicesTile /></div>
      <div className="md:col-span-2"><AgentActionsTile /></div>
    </div>
  );
}

/** Infrastructure — detailed cluster metrics */
function InfrastructureTab() {
  return (
    <div className="space-y-8">
      <ErrorBoundary><ClusterTopology /></ErrorBoundary>
      <ErrorBoundary><ClusterOverview /></ErrorBoundary>
      <ErrorBoundary><ResourceMetrics /></ErrorBoundary>
      <ErrorBoundary><ServicesStatus /></ErrorBoundary>
      <ErrorBoundary><NetworkStats /></ErrorBoundary>
      <ErrorBoundary><ServiceDowntime /></ErrorBoundary>
    </div>
  );
}

/** Kubernetes — pod and namespace details */
function K8sTab() {
  return (
    <ErrorBoundary><K8sInfo /></ErrorBoundary>
  );
}

/** Smart Devices — Dyson + Bosch detailed metrics */
function SmartDevicesTab() {
  return (
    <ErrorBoundary><SmartDevicesOverview /></ErrorBoundary>
  );
}
