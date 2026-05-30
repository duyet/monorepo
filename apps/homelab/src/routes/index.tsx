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
    <div className="rd-meter" style={{ marginTop: 6 }}>
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
    <div style={{ paddingTop: "clamp(32px,4vw,56px)", paddingBottom: "clamp(48px,6vw,80px)" }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div className="rd-eyebrow" style={{ marginBottom: 12 }}>
          <StatusDot status={onlineCount === totalNodes ? "online" : "degraded"} />
          Infrastructure · homelab.duyet.net
        </div>
        <h1 className="rd-display" style={{ fontSize: "clamp(2.2rem,5vw,3.4rem)", marginTop: 0 }}>
          Homelab
        </h1>
        <p className="rd-lead" style={{ marginTop: 14 }}>
          Cluster health, running services, and smart-home devices. Data captured by AI agent.
        </p>
      </div>

      {/* ── Summary stat strip ──────────────────────────────────── */}
      <div
        className="signalbar"
        style={{
          gridTemplateColumns: "repeat(5,1fr)",
          marginBottom: 28,
        }}
      >
        {/* Nodes online */}
        <div className="signal-tile">
          <div className="rd-eyebrow" style={{ gap: 6 }}>
            <Server size={13} style={{ color: "var(--rd-text-3)" }} />
            Nodes
          </div>
          <div className="rd-bigstat" style={{ marginTop: 10 }}>
            {onlineCount}
            <span className="rd-unit">/ {totalNodes}</span>
          </div>
          <div className="rd-mono rd-dim" style={{ fontSize: 11 }}>online</div>
        </div>

        {/* Services running */}
        <div className="signal-tile">
          <div className="rd-eyebrow" style={{ gap: 6 }}>
            <Layers size={13} style={{ color: "var(--rd-text-3)" }} />
            Services
          </div>
          <div className="rd-bigstat" style={{ marginTop: 10 }}>
            {runningServices}
            <span className="rd-unit">/ {totalServices}</span>
          </div>
          <div className="rd-mono rd-dim" style={{ fontSize: 11 }}>{namespaceCount} namespaces</div>
        </div>

        {/* Avg CPU */}
        <div className="signal-tile">
          <div className="rd-eyebrow" style={{ gap: 6 }}>
            <Cpu size={13} style={{ color: "var(--rd-text-3)" }} />
            Avg CPU
          </div>
          <div className="rd-bigstat" style={{ marginTop: 10 }}>
            {clusterStats.avgCpu.toFixed(1)}
            <span className="rd-unit">%</span>
          </div>
          <MeterBar value={clusterStats.avgCpu} />
        </div>

        {/* Memory */}
        <div className="signal-tile">
          <div className="rd-eyebrow" style={{ gap: 6 }}>
            <MemoryStick size={13} style={{ color: "var(--rd-text-3)" }} />
            Memory
          </div>
          <div className="rd-bigstat" style={{ marginTop: 10 }}>
            {clusterStats.usedMemory.toFixed(0)}
            <span className="rd-unit">/ {clusterStats.totalMemory} GB</span>
          </div>
          <MeterBar value={memPercent} />
        </div>

        {/* Smart devices */}
        <div className="signal-tile">
          <div className="rd-eyebrow" style={{ gap: 6 }}>
            <Smartphone size={13} style={{ color: "var(--rd-text-3)" }} />
            Devices
          </div>
          <div className="rd-bigstat" style={{ marginTop: 10 }}>
            {onlineDevices.length}
            <span className="rd-unit">/ {devices.length}</span>
          </div>
          <div className="rd-mono rd-dim" style={{ fontSize: 11 }}>online</div>
        </div>
      </div>

      {/* ── Bento grid ─────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12,1fr)",
          gap: 12,
          alignItems: "start",
        }}
      >
        {/* ── Nodes tile (tall, left) ─ */}
        <div
          className="rd-card rd-card-pad"
          style={{ gridColumn: "span 12" }}
          data-md-col="span 5"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="rd-eyebrow">
              <Server size={13} />
              Nodes
            </span>
            <span className="rd-chip rd-mono" style={{ fontSize: 11 }}>
              {onlineCount}/{totalNodes} online
            </span>
          </div>

          {/* Node chip strip */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
            {nodes.map((node) => (
              <span
                key={node.id}
                className="rd-chip rd-mono"
                style={{
                  fontSize: 10.5,
                  gap: 5,
                  opacity: node.status === "offline" ? 0.5 : 1,
                }}
              >
                <StatusDot status={node.status} />
                {node.name}
              </span>
            ))}
          </div>

          {/* Per-node rows */}
          <div className="rd-rows" style={{ borderTop: "1px solid var(--rd-line)" }}>
            {nodes.map((node) => (
              <div
                key={node.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  padding: "14px 0",
                  borderBottom: "1px solid var(--rd-line)",
                }}
              >
                {/* Left: name + meta */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <StatusDot status={node.status} />
                    <span className="rd-mono" style={{ fontWeight: 600, fontSize: 13.5 }}>
                      {node.name}
                    </span>
                    <span className="rd-chip rd-mono" style={{ fontSize: 10 }}>
                      {typeLabels[node.type] ?? node.type}
                    </span>
                  </div>
                  <div className="rd-mono rd-dim" style={{ fontSize: 11, marginBottom: 10 }}>
                    {node.ip} · up {node.uptime}
                  </div>
                  {/* CPU meter */}
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                      <span className="rd-mono rd-dim">CPU</span>
                      <span className="rd-mono" style={{ fontWeight: 600 }}>{node.cpu}%</span>
                    </div>
                    <MeterBar value={node.cpu} />
                  </div>
                  {/* RAM meter */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                      <span className="rd-mono rd-dim">RAM</span>
                      <span className="rd-mono" style={{ fontWeight: 600 }}>{node.memory}%</span>
                    </div>
                    <MeterBar value={node.memory} />
                  </div>
                </div>
                {/* Right: mem GB */}
                <div style={{ textAlign: "right", alignSelf: "start" }}>
                  <div className="rd-mono rd-dim" style={{ fontSize: 11 }}>
                    {node.memoryUsed}/{node.memoryTotal} GB
                  </div>
                  <div className="rd-mono rd-dim" style={{ fontSize: 11, marginTop: 4 }}>
                    {node.services} svc
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Services tile ─ */}
        <div className="rd-card rd-card-pad" style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="rd-eyebrow">
              <Activity size={13} />
              Running services
            </span>
            <span className="rd-chip rd-mono" style={{ fontSize: 11 }}>
              {runningServices}/{totalServices}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: 8,
            }}
          >
            {allServices.map((svc) => (
              <div
                key={`${svc.name}-${svc.node}`}
                className="rd-card"
                style={{ padding: "13px 15px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                  <span className="rd-dot rd-ok" />
                  <span className="rd-mono" style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {svc.name}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                  <span className="rd-chip rd-mono" style={{ fontSize: 10 }}>{svc.namespace}</span>
                  <span className="rd-chip rd-mono" style={{ fontSize: 10 }}>:{svc.port}</span>
                </div>
                <div className="rd-mono rd-dim" style={{ fontSize: 11, marginBottom: 6 }}>
                  {svc.node}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                  <span className="rd-mono rd-dim">
                    CPU <span style={{ color: "var(--rd-text)", fontWeight: 600 }}>{svc.cpu}%</span>
                  </span>
                  <span className="rd-mono rd-dim">{svc.memory} MB</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cluster stats ─ */}
        <div className="rd-card rd-card-pad" style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Activity size={14} style={{ color: "var(--rd-text-3)" }} />
            <span className="rd-eyebrow">Cluster</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
              gap: 20,
            }}
          >
            {/* Avg CPU */}
            <div>
              <div className="rd-eyebrow" style={{ marginBottom: 8 }}>
                <Activity size={12} />
                Avg CPU
              </div>
              <div className="rd-bigstat" style={{ fontSize: "1.65rem" }}>
                {clusterStats.avgCpu.toFixed(1)}
                <span className="rd-unit">%</span>
              </div>
              <MeterBar value={clusterStats.avgCpu} />
            </div>

            {/* Memory */}
            <div>
              <div className="rd-eyebrow" style={{ marginBottom: 8 }}>
                <HardDrive size={12} />
                Memory
              </div>
              <div className="rd-bigstat" style={{ fontSize: "1.65rem" }}>
                {clusterStats.usedMemory.toFixed(0)}
                <span className="rd-unit">/ {clusterStats.totalMemory} GB</span>
              </div>
              <MeterBar value={memPercent} />
            </div>

            {/* Storage */}
            <div>
              <div className="rd-eyebrow" style={{ marginBottom: 8 }}>
                <Database size={12} />
                Storage
              </div>
              <div className="rd-bigstat" style={{ fontSize: "1.65rem" }}>
                {(clusterStats.totalStorage / 1024).toFixed(1)}
                <span className="rd-unit">TB</span>
              </div>
            </div>

            {/* Incidents */}
            <div>
              <div className="rd-eyebrow" style={{ marginBottom: 8 }}>
                <AlertCircle size={12} />
                Incidents
              </div>
              <div className="rd-bigstat" style={{ fontSize: "1.65rem" }}>
                {downtimeHistory.length}
                <span className="rd-unit">recent</span>
              </div>
            </div>

            {/* Svc memory */}
            <div>
              <div className="rd-eyebrow" style={{ marginBottom: 8 }}>
                <MemoryStick size={12} />
                Svc memory
              </div>
              <div className="rd-bigstat" style={{ fontSize: "1.65rem" }}>
                {(totalServiceMem / 1024).toFixed(1)}
                <span className="rd-unit">GB</span>
              </div>
              <div className="rd-mono rd-dim" style={{ fontSize: 11, marginTop: 6 }}>
                {allServices.length} services
              </div>
            </div>

            {/* Top service by CPU */}
            {busiestSvc ? (
              <div>
                <div className="rd-eyebrow" style={{ marginBottom: 8 }}>
                  <Cpu size={12} />
                  Top service
                </div>
                <div
                  className="rd-mono"
                  style={{ fontWeight: 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {busiestSvc.name}
                </div>
                <div className="rd-bigstat" style={{ fontSize: "1.65rem", marginTop: 4 }}>
                  {busiestSvc.cpu.toFixed(1)}
                  <span className="rd-unit">% CPU</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Network speed ─ */}
        <div className="rd-card rd-card-pad" style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="rd-eyebrow">
              <Network size={13} />
              Network
            </span>
            <Gauge size={14} style={{ color: "var(--rd-text-3)" }} />
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div className="rd-mono rd-dim" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <ArrowDown size={12} /> Down
              </div>
              <div className="rd-bigstat" style={{ fontSize: "1.65rem" }}>
                {speedTest.download}
                <span className="rd-unit">Mbps</span>
              </div>
            </div>
            <div>
              <div className="rd-mono rd-dim" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <ArrowUp size={12} /> Up
              </div>
              <div className="rd-bigstat" style={{ fontSize: "1.65rem" }}>
                {speedTest.upload}
                <span className="rd-unit">Mbps</span>
              </div>
            </div>
            <div>
              <div className="rd-mono rd-dim" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <Gauge size={12} /> Ping
              </div>
              <div className="rd-bigstat" style={{ fontSize: "1.65rem" }}>
                {speedTest.ping}
                <span className="rd-unit">ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Node type breakdown ─ */}
        <div className="rd-card rd-card-pad" style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="rd-eyebrow">
              <Layers size={13} />
              Node types
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.entries(typeCounts).map(([type, count]) => (
              <div
                key={type}
                className="rd-card"
                style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4, minWidth: 90 }}
              >
                <div className="rd-mono rd-dim" style={{ fontSize: 11 }}>{typeLabels[type] ?? type}</div>
                <div className="rd-bigstat" style={{ fontSize: "1.5rem" }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Smart devices ─ */}
        <div className="rd-card rd-card-pad" style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="rd-eyebrow">
              <Smartphone size={13} />
              Smart devices
            </span>
            <span className="rd-chip rd-mono" style={{ fontSize: 11 }}>
              {onlineDevices.length}/{devices.length} online
            </span>
          </div>
          <div className="rd-g2" style={{ gap: 8 }}>
            {devices.map((d) => (
              <div
                key={d.id}
                className="rd-card"
                style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
              >
                <div>
                  <div className="rd-mono rd-dim" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                    {d.type.replace(/-/g, " ")}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>{d.name}</div>
                  <div className="rd-mono rd-dim" style={{ fontSize: 11, marginTop: 2 }}>{d.brand}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }} className="rd-chip rd-mono">
                  <StatusDot status={d.status} />
                  {d.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent incidents ─ */}
        <div className="rd-card rd-card-pad" style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="rd-eyebrow">
              <AlertCircle size={13} />
              Recent incidents
            </span>
            <span className="rd-chip rd-mono" style={{ fontSize: 11 }}>
              {downtimeHistory.length} logged
            </span>
          </div>
          {downtimeHistory.length === 0 ? (
            <p className="rd-mono rd-dim" style={{ fontSize: 12.5 }}>
              No incidents in the last 30 days.
            </p>
          ) : (
            <div className="rd-rows">
              {downtimeHistory.map((inc, i) => (
                <div
                  key={i}
                  className="rd-row"
                  style={{ gridTemplateColumns: "auto 1fr auto", padding: "14px 4px" }}
                >
                  <AlertCircle size={15} style={{ color: "var(--rd-warn)" }} />
                  <div>
                    <div>
                      <span className="rd-mono" style={{ fontWeight: 600, fontSize: 13 }}>{inc.service}</span>
                      <span className="rd-muted" style={{ marginLeft: 8, fontSize: 12.5 }}>— {inc.reason}</span>
                    </div>
                    <div className="rd-mono rd-dim" style={{ fontSize: 11, marginTop: 3 }}>{inc.start}</div>
                  </div>
                  <div className="rd-mono rd-dim" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
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
      <div style={{ marginTop: "clamp(40px,5vw,64px)" }}>
        <DashboardTabs
          infrastructure={infrastructure}
          smartDevices={smartDevices}
        />
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: 40,
          paddingTop: 16,
          borderTop: "1px solid var(--rd-line)",
        }}
      >
        <p className="rd-mono rd-dim" style={{ fontSize: 11.5 }}>
          Not a realtime dashboard. Data is captured by AI Agent and committed
          to source code. Snapshot taken at {snapshotDate}.
        </p>
      </div>
    </div>
  );
}
