import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Clock,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Layers,
  MemoryStick,
  Network,
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

const snapshotDate = new Date().toLocaleString();

export const Route = createFileRoute("/")({
  component: HomelabPage,
});

// ------------------------------------------------------------------
// Small presentational helpers
// ------------------------------------------------------------------

function StatusDot({ status }: { status: string }) {
  const cls =
    status === "online"
      ? "rd-dot rd-ok rd-pulse"
      : status === "degraded"
        ? "rd-dot rd-warn"
        : "rd-dot rd-down";
  return <span className={cls} />;
}

function MeterBar({
  value,
  warn = 55,
  danger = 75,
}: {
  value: number;
  warn?: number;
  danger?: number;
}) {
  const bg =
    value > danger
      ? "var(--rd-down)"
      : value > warn
        ? "var(--rd-warn)"
        : "var(--rd-ok)";
  return (
    <div className="rd-meter mt-[6px]">
      <i style={{ width: `${Math.min(value, 100)}%`, background: bg }} />
    </div>
  );
}

// ------------------------------------------------------------------
// Main page
// ------------------------------------------------------------------

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
          <div className="rd-bigstat mt-[10px]">
            {onlineCount}
            <span className="rd-unit">/ {totalNodes}</span>
          </div>
          <div className="rd-mono rd-dim text-[11px]">online</div>
        </div>

        {/* Services running */}
        <div className="signal-tile">
          <div className="rd-eyebrow gap-[6px]">
            <Layers size={13} style={{ color: "var(--rd-text-3)" }} />
            Services
          </div>
          <div className="rd-bigstat mt-[10px]">
            {runningServices}
            <span className="rd-unit">/ {totalServices}</span>
          </div>
          <div className="rd-mono rd-dim text-[11px]">{namespaceCount} namespaces</div>
        </div>

        {/* Avg CPU */}
        <div className="signal-tile">
          <div className="rd-eyebrow gap-[6px]">
            <Cpu size={13} style={{ color: "var(--rd-text-3)" }} />
            Avg CPU
          </div>
          <div className="rd-bigstat mt-[10px]">
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
          <div className="rd-bigstat mt-[10px]">
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
          <div className="rd-bigstat mt-[10px]">
            {onlineDevices.length}
            <span className="rd-unit">/ {devices.length}</span>
          </div>
          <div className="rd-mono rd-dim text-[11px]">online</div>
        </div>
      </div>

      {/* ── Bento grid ─────────────────────────────────────────── */}
      <div
        className="grid grid-cols-[repeat(12,1fr)] gap-3 items-start"
      >
        {/* ── Nodes tile (tall, left) ─ */}
        <div
          className="rd-card rd-card-pad col-span-12"
          data-md-col="span 5"
        >
          <div className="flex items-center justify-between mb-[14px]">
            <span className="rd-eyebrow">
              <Server size={13} />
              Nodes
            </span>
            <span className="rd-chip rd-mono text-[11px]">
              {onlineCount}/{totalNodes} online
            </span>
          </div>

          {/* Node chip strip */}
          <div className="flex flex-wrap gap-[6px] mb-[18px]">
            {nodes.map((node) => (
              <span
                key={node.id}
                className="rd-chip rd-mono text-[10.5px] gap-[5px]"
                style={{ opacity: node.status === "offline" ? 0.5 : 1 }}
              >
                <StatusDot status={node.status} />
                {node.name}
              </span>
            ))}
          </div>

          {/* Per-node rows */}
          <div className="rd-rows border-t border-[var(--rd-line)]">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="grid grid-cols-[1fr_auto] gap-3 py-[14px] border-b border-[var(--rd-line)]"
              >
                {/* Left: name + meta */}
                <div>
                  <div className="flex items-center gap-2 mb-[6px]">
                    <StatusDot status={node.status} />
                    <span className="rd-mono font-semibold text-[13.5px]">
                      {node.name}
                    </span>
                    <span className="rd-chip rd-mono text-[10px]">
                      {typeLabels[node.type] ?? node.type}
                    </span>
                  </div>
                  <div className="rd-mono rd-dim text-[11px] mb-[10px]">
                    {node.ip} · up {node.uptime}
                  </div>
                  {/* CPU meter */}
                  <div className="mb-[6px]">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="rd-mono rd-dim">CPU</span>
                      <span className="rd-mono font-semibold">{node.cpu}%</span>
                    </div>
                    <MeterBar value={node.cpu} />
                  </div>
                  {/* RAM meter */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="rd-mono rd-dim">RAM</span>
                      <span className="rd-mono font-semibold">{node.memory}%</span>
                    </div>
                    <MeterBar value={node.memory} />
                  </div>
                </div>
                {/* Right: mem GB */}
                <div className="text-right self-start">
                  <div className="rd-mono rd-dim text-[11px]">
                    {node.memoryUsed}/{node.memoryTotal} GB
                  </div>
                  <div className="rd-mono rd-dim text-[11px] mt-1">
                    {node.services} svc
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Services tile ─ */}
        <div className="rd-card rd-card-pad col-span-12">
          <div className="flex items-center justify-between mb-[14px]">
            <span className="rd-eyebrow">
              <Activity size={13} />
              Running services
            </span>
            <span className="rd-chip rd-mono text-[11px]">
              {runningServices}/{totalServices}
            </span>
          </div>

          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2"
          >
            {allServices.map((svc) => (
              <div
                key={`${svc.name}-${svc.node}`}
                className="rd-card px-[15px] py-[13px]"
              >
                <div className="flex items-center gap-[7px] mb-2">
                  <span className="rd-dot rd-ok" />
                  <span className="rd-mono font-semibold text-[13px] truncate">
                    {svc.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-[6px] mb-2">
                  <span className="rd-chip rd-mono text-[10px]">{svc.namespace}</span>
                  <span className="rd-chip rd-mono text-[10px]">:{svc.port}</span>
                </div>
                <div className="rd-mono rd-dim text-[11px] mb-[6px]">
                  {svc.node}
                </div>
                <div className="flex justify-between text-[11.5px]">
                  <span className="rd-mono rd-dim">
                    CPU <span className="text-[var(--rd-text)] font-semibold">{svc.cpu}%</span>
                  </span>
                  <span className="rd-mono rd-dim">{svc.memory} MB</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cluster stats ─ */}
        <div className="rd-card rd-card-pad col-span-12">
          <div className="flex items-center gap-2 mb-[18px]">
            <Activity size={14} style={{ color: "var(--rd-text-3)" }} />
            <span className="rd-eyebrow">Cluster</span>
          </div>
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5"
          >
            {/* Avg CPU */}
            <div>
              <div className="rd-eyebrow mb-2">
                <Activity size={12} />
                Avg CPU
              </div>
              <div className="rd-bigstat text-[1.65rem]">
                {clusterStats.avgCpu.toFixed(1)}
                <span className="rd-unit">%</span>
              </div>
              <MeterBar value={clusterStats.avgCpu} />
            </div>

            {/* Memory */}
            <div>
              <div className="rd-eyebrow mb-2">
                <HardDrive size={12} />
                Memory
              </div>
              <div className="rd-bigstat text-[1.65rem]">
                {clusterStats.usedMemory.toFixed(0)}
                <span className="rd-unit">/ {clusterStats.totalMemory} GB</span>
              </div>
              <MeterBar value={memPercent} />
            </div>

            {/* Storage */}
            <div>
              <div className="rd-eyebrow mb-2">
                <Database size={12} />
                Storage
              </div>
              <div className="rd-bigstat text-[1.65rem]">
                {(clusterStats.totalStorage / 1024).toFixed(1)}
                <span className="rd-unit">TB</span>
              </div>
            </div>

            {/* Incidents */}
            <div>
              <div className="rd-eyebrow mb-2">
                <AlertCircle size={12} />
                Incidents
              </div>
              <div className="rd-bigstat text-[1.65rem]">
                {downtimeHistory.length}
                <span className="rd-unit">recent</span>
              </div>
            </div>

            {/* Svc memory */}
            <div>
              <div className="rd-eyebrow mb-2">
                <MemoryStick size={12} />
                Svc memory
              </div>
              <div className="rd-bigstat text-[1.65rem]">
                {(totalServiceMem / 1024).toFixed(1)}
                <span className="rd-unit">GB</span>
              </div>
              <div className="rd-mono rd-dim text-[11px] mt-[6px]">
                {allServices.length} services
              </div>
            </div>

            {/* Top service by CPU */}
            {busiestSvc ? (
              <div>
                <div className="rd-eyebrow mb-2">
                  <Cpu size={12} />
                  Top service
                </div>
                <div
                  className="rd-mono font-semibold text-[13.5px] truncate"
                >
                  {busiestSvc.name}
                </div>
                <div className="rd-bigstat text-[1.65rem] mt-1">
                  {busiestSvc.cpu.toFixed(1)}
                  <span className="rd-unit">% CPU</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Network speed ─ */}
        <div className="rd-card rd-card-pad col-span-12">
          <div className="flex items-center justify-between mb-[14px]">
            <span className="rd-eyebrow">
              <Network size={13} />
              Network
            </span>
            <Gauge size={14} style={{ color: "var(--rd-text-3)" }} />
          </div>
          <div className="flex flex-wrap gap-8">
            <div>
              <div className="rd-mono rd-dim text-[11.5px] flex items-center gap-1 mb-[6px]">
                <ArrowDown size={12} /> Down
              </div>
              <div className="rd-bigstat text-[1.65rem]">
                {speedTest.download}
                <span className="rd-unit">Mbps</span>
              </div>
            </div>
            <div>
              <div className="rd-mono rd-dim text-[11.5px] flex items-center gap-1 mb-[6px]">
                <ArrowUp size={12} /> Up
              </div>
              <div className="rd-bigstat text-[1.65rem]">
                {speedTest.upload}
                <span className="rd-unit">Mbps</span>
              </div>
            </div>
            <div>
              <div className="rd-mono rd-dim text-[11.5px] flex items-center gap-1 mb-[6px]">
                <Gauge size={12} /> Ping
              </div>
              <div className="rd-bigstat text-[1.65rem]">
                {speedTest.ping}
                <span className="rd-unit">ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Node type breakdown ─ */}
        <div className="rd-card rd-card-pad col-span-12">
          <div className="flex items-center justify-between mb-[14px]">
            <span className="rd-eyebrow">
              <Layers size={13} />
              Node types
            </span>
          </div>
          <div className="flex flex-wrap gap-[10px]">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div
                key={type}
                className="rd-card flex flex-col gap-1 min-w-[90px] px-4 py-3"
              >
                <div className="rd-mono rd-dim text-[11px]">{typeLabels[type] ?? type}</div>
                <div className="rd-bigstat text-[1.5rem]">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Smart devices ─ */}
        <div className="rd-card rd-card-pad col-span-12">
          <div className="flex items-center justify-between mb-[14px]">
            <span className="rd-eyebrow">
              <Smartphone size={13} />
              Smart devices
            </span>
            <span className="rd-chip rd-mono text-[11px]">
              {onlineDevices.length}/{devices.length} online
            </span>
          </div>
          <div className="rd-g2 gap-2">
            {devices.map((d) => (
              <div
                key={d.id}
                className="rd-card flex items-center justify-between gap-3 px-4 py-[14px]"
              >
                <div>
                  <div className="rd-mono rd-dim text-[10.5px] uppercase tracking-[0.1em] mb-1">
                    {d.type.replace(/-/g, " ")}
                  </div>
                  <div className="font-semibold text-sm tracking-[-0.01em]">{d.name}</div>
                  <div className="rd-mono rd-dim text-[11px] mt-[2px]">{d.brand}</div>
                </div>
                <div className="rd-chip rd-mono flex items-center gap-[7px]">
                  <StatusDot status={d.status} />
                  {d.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent incidents ─ */}
        <div className="rd-card rd-card-pad col-span-12">
          <div className="flex items-center justify-between mb-[14px]">
            <span className="rd-eyebrow">
              <AlertCircle size={13} />
              Recent incidents
            </span>
            <span className="rd-chip rd-mono text-[11px]">
              {downtimeHistory.length} logged
            </span>
          </div>
          {downtimeHistory.length === 0 ? (
            <p className="rd-mono rd-dim text-[12.5px]">
              No incidents in the last 30 days.
            </p>
          ) : (
            <div className="rd-rows">
              {downtimeHistory.map((inc, i) => (
                <div
                  key={i}
                  className="rd-row grid-cols-[auto_1fr_auto] px-1 py-[14px]"
                >
                  <AlertCircle size={15} style={{ color: "var(--rd-warn)" }} />
                  <div>
                    <div>
                      <span className="rd-mono font-semibold text-[13px]">{inc.service}</span>
                      <span className="rd-muted ml-2 text-[12.5px]">— {inc.reason}</span>
                    </div>
                    <div className="rd-mono rd-dim text-[11px] mt-[3px]">{inc.start}</div>
                  </div>
                  <div className="rd-mono rd-dim text-xs flex items-center gap-1">
                    <Clock size={12} />
                    {inc.duration}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
        <p className="rd-mono rd-dim text-[11.5px]">
          Not a realtime dashboard. Data is captured by AI Agent and committed
          to source code. Snapshot taken at {snapshotDate}.
        </p>
      </div>
    </div>
  );
}
