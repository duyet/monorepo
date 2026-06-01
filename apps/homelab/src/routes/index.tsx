import { createFileRoute } from "@tanstack/react-router";
import {
  Cpu,
  Layers,
  MemoryStick,
  Server,
  Smartphone,
} from "lucide-react";
import { DashboardTabs } from "@/components/DashboardTabs";
import { ClusterOverview } from "@/components/dashboard/ClusterOverview";
import { ClusterTopology } from "@/components/dashboard/ClusterTopology";
import { NetworkStats } from "@/components/dashboard/NetworkStats";
import { ResourceMetrics } from "@/components/dashboard/ResourceMetrics";
import { ServiceDowntime } from "@/components/dashboard/ServiceDowntime";
import { ServicesStatus } from "@/components/dashboard/ServicesStatus";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SmartDevicesOverview } from "@/components/smart-devices/SmartDevicesOverview";
import {
  useClusterStats,
  useDowntimeHistory,
  useNetworkStats,
  useNodes,
  useServices,
  useSmartDevices,
} from "@/hooks/useDashboard";
import {
  ClusterStatsTile,
  IncidentsTile,
  MeterBar,
  NetworkTile,
  NodesTile,
  NodeTypeTile,
  ServicesTile,
  SmartDevicesTile,
  StatusDot,
} from "@/components/tiles";

const snapshotDate = new Date().toLocaleString();

export const Route = createFileRoute("/")({
  component: HomelabPage,
});

function HomelabPage() {
  const { nodes, onlineCount, totalNodes } = useNodes();
  const { runningServices, totalServices, allServices } = useServices();
  const { devices } = useSmartDevices();
  const clusterStats = useClusterStats();
  const { speedTest } = useNetworkStats();
  const downtimeHistory = useDowntimeHistory();
  const onlineDevices = devices.filter((d) => d.status !== "offline");

  // Derived metrics — cheap reduces over existing data
  const totalServiceMem = allServices.reduce((acc, s) => acc + s.memory, 0);
  const busiestSvc = [...allServices].sort((a, b) => b.cpu - a.cpu)[0];
  const namespaceCount = new Set(allServices.map((s) => s.namespace)).size;
  const typeLabels: Record<string, string> = {
    minipc: "minipc",
    "raspberry-pi": "rpi",
    "banana-board": "banana",
    server: "server",
  };
  const typeCounts = nodes.reduce(
    (acc, n) => {
      acc[n.type] = (acc[n.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const memPercent =
    clusterStats.totalMemory > 0
      ? (clusterStats.usedMemory / clusterStats.totalMemory) * 100
      : 0;

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
    <div className="pt-[clamp(32px,4vw,56px)] pb-[clamp(48px,6vw,80px)]">
      {/* Page header */}
      <div className="mb-8">
        <div className="rd-eyebrow mb-3">
          <StatusDot status={onlineCount === totalNodes ? "online" : "degraded"} />
          Infrastructure · homelab.duyet.net
        </div>
        <h1 className="rd-display text-[clamp(2.2rem,5vw,3.4rem)] mt-0">
          Homelab
        </h1>
        <p className="rd-lead mt-[14px]">
          Cluster health, running services, and smart-home devices. Data captured by AI agent.
        </p>
      </div>

      {/* ── Summary stat strip ──────────────────────────────────── */}
      <div
        className="signalbar grid-cols-[repeat(5,1fr)] mb-7"
      >
        {/* Nodes online */}
        <div className="signal-tile">
          <div className="rd-eyebrow gap-[6px]">
            <Server size={13} style={{ color: "var(--rd-text-3)" }} />
            Nodes
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none mt-[10px]">
            {onlineCount}
            <span className="rd-unit">/ {totalNodes}</span>
          </div>
          <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px]">online</div>
        </div>

        {/* Services running */}
        <div className="signal-tile">
          <div className="rd-eyebrow gap-[6px]">
            <Layers size={13} style={{ color: "var(--rd-text-3)" }} />
            Services
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none mt-[10px]">
            {runningServices}
            <span className="rd-unit">/ {totalServices}</span>
          </div>
          <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px]">{namespaceCount} namespaces</div>
        </div>

        {/* Avg CPU */}
        <div className="signal-tile">
          <div className="rd-eyebrow gap-[6px]">
            <Cpu size={13} style={{ color: "var(--rd-text-3)" }} />
            Avg CPU
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none mt-[10px]">
            {clusterStats.avgCpu.toFixed(1)}
            <span className="rd-unit">%</span>
          </div>
          <MeterBar value={clusterStats.avgCpu} />
        </div>

        {/* Memory */}
        <div className="signal-tile">
          <div className="rd-eyebrow gap-[6px]">
            <MemoryStick size={13} style={{ color: "var(--rd-text-3)" }} />
            Memory
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none mt-[10px]">
            {clusterStats.usedMemory.toFixed(0)}
            <span className="rd-unit">/ {clusterStats.totalMemory} GB</span>
          </div>
          <MeterBar value={memPercent} />
        </div>

        {/* Smart devices */}
        <div className="signal-tile">
          <div className="rd-eyebrow gap-[6px]">
            <Smartphone size={13} style={{ color: "var(--rd-text-3)" }} />
            Devices
          </div>
          <div className="text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none mt-[10px]">
            {onlineDevices.length}
            <span className="rd-unit">/ {devices.length}</span>
          </div>
          <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px]">online</div>
        </div>
      </div>

      {/* ── Bento grid ─────────────────────────────────────────── */}
      <div
        className="grid grid-cols-[repeat(12,1fr)] gap-3 items-start"
      >
        <NodesTile
          nodes={nodes}
          onlineCount={onlineCount}
          totalNodes={totalNodes}
          typeLabels={typeLabels}
        />
        <ServicesTile
          allServices={allServices}
          runningServices={runningServices}
          totalServices={totalServices}
          namespaceCount={namespaceCount}
        />
        <ClusterStatsTile
          clusterStats={clusterStats}
          memPercent={memPercent}
          totalServiceMem={totalServiceMem}
          busiestSvc={busiestSvc}
          downtimeHistory={downtimeHistory}
          serviceCount={allServices.length}
        />
        <NetworkTile speedTest={speedTest} />
        <NodeTypeTile typeCounts={typeCounts} typeLabels={typeLabels} />
        <SmartDevicesTile devices={devices} onlineDevices={onlineDevices} />
        <IncidentsTile downtimeHistory={downtimeHistory} />
      </div>

      {/* ── Detailed tabs ─────────────────────────────────────── */}
      <div className="mt-[clamp(40px,5vw,64px)]">
        <DashboardTabs
          infrastructure={infrastructure}
          smartDevices={smartDevices}
        />
      </div>

      {/* Footer note */}
      <div
        className="mt-10 pt-4 border-t border-[var(--rd-line)]"
      >
        <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px]">
          Not a realtime dashboard. Data is captured by AI Agent and committed
          to source code. Snapshot taken at {snapshotDate}.
        </p>
      </div>
    </div>
  );
}
