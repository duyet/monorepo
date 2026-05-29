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
  Wifi,
} from "lucide-react";
import { Badge } from "@duyet/components";
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

// Flat bento tile — hairline border, semantic tokens, no shadow
const TILE = "rounded-xl border border-border bg-card p-4 sm:p-5";

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
    <div className="space-y-6">
      {/* Header */}
      <section className="pt-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Infrastructure
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Homelab
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cluster health, running services, and smart home devices.
        </p>
      </section>

      {/* Bento grid — flat token tiles, hairline borders, no shadow.
          12-col layout (desktop), varied spans:
          [Nodes 5 / row-span-2 ][Services 4][Devices 3]
          [Nodes cont.          ][Node types 4][Top svc 3]
          [Cluster stats 8                    ][Network 4]
          [Service memory 4][Recent incidents 8         ]
      */}
      <div className="grid grid-cols-12 gap-3 auto-rows-min">
        {/* Nodes — tall tile with per-node uptime + memory */}
        <div className={`${TILE} col-span-12 md:col-span-5 md:row-span-2`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Nodes
            </span>
            <Server className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-semibold tabular-nums tracking-tight">
            {onlineCount}
            <span className="text-lg font-normal text-muted-foreground">
              /{totalNodes}
            </span>
          </div>
          <p className="mt-0.5 mb-4 text-xs text-muted-foreground">online</p>
          <ul className="space-y-2.5">
            {nodes.map((node) => (
              <li key={node.id} className="text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        node.status === "online"
                          ? "bg-green-500"
                          : node.status === "degraded"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="font-mono text-foreground">
                      {node.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                    {node.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center justify-between pl-3.5 font-mono text-[10px] text-muted-foreground">
                  <span>{node.uptime}</span>
                  <span className="tabular-nums">
                    {node.memoryUsed}/{node.memoryTotal}GB
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className={`${TILE} col-span-6 md:col-span-4`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Services
            </span>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-semibold tabular-nums tracking-tight">
            {runningServices}
            <span className="text-lg font-normal text-muted-foreground">
              /{totalServices}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            running · {namespaceCount} namespaces
          </p>
          <ul className="mt-3 space-y-1">
            {allServices.slice(0, 5).map((svc) => (
              <li
                key={`${svc.name}-${svc.node}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span className="h-1 w-1 flex-shrink-0 rounded-full bg-green-500" />
                <span className="truncate font-mono">{svc.name}</span>
              </li>
            ))}
            {allServices.length > 5 && (
              <li className="pl-2.5 text-xs text-muted-foreground">
                +{allServices.length - 5} more
              </li>
            )}
          </ul>
        </div>

        {/* Devices */}
        <div className={`${TILE} col-span-6 md:col-span-3`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Devices
            </span>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-semibold tabular-nums tracking-tight">
            {onlineDevices.length}
            <span className="text-lg font-normal text-muted-foreground">
              /{devices.length}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">online</p>
          <ul className="mt-3 space-y-1.5">
            {devices.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="truncate text-foreground">{d.name}</span>
                <Badge
                  variant="outline"
                  className="ml-2 flex-shrink-0 px-1.5 py-0 text-[10px]"
                >
                  {d.status}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        {/* Node types — count by hardware type */}
        <div className={`${TILE} col-span-6 md:col-span-4`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Node types
            </span>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="space-y-1.5">
            {Object.entries(typeCounts).map(([type, count]) => (
              <li
                key={type}
                className="flex items-center justify-between text-xs"
              >
                <span className="font-mono text-foreground">
                  {typeLabels[type] ?? type}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top service by CPU */}
        <div className={`${TILE} col-span-6 md:col-span-3`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Top service
            </span>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </div>
          {busiestSvc ? (
            <>
              <div className="truncate font-mono text-base font-semibold text-foreground">
                {busiestSvc.name}
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {busiestSvc.cpu.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground">
                  % CPU
                </span>
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No services.</p>
          )}
        </div>

        {/* Cluster stats — wide tile with 6 metrics */}
        <div className={`${TILE} col-span-12 md:col-span-8`}>
          <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Activity className="h-4 w-4" />
            Cluster
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                Avg CPU
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {clusterStats.avgCpu.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground">
                  %
                </span>
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <HardDrive className="h-3 w-3" />
                Memory
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {clusterStats.usedMemory.toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{clusterStats.totalMemory}GB
                </span>
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Gauge className="h-3 w-3" />
                Mem used
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {memPercent.toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground">
                  %
                </span>
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Database className="h-3 w-3" />
                Storage
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {(clusterStats.totalStorage / 1024).toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground">
                  TB
                </span>
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Server className="h-3 w-3" />
                Online
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {onlineCount}
                <span className="text-sm font-normal text-muted-foreground">
                  /{totalNodes} nodes
                </span>
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                Incidents
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {downtimeHistory.length}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  recent
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Network speed */}
        <div className={`${TILE} col-span-12 md:col-span-4`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Network
            </span>
            <Network className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <ArrowDown className="h-3 w-3" />
                Down
              </p>
              <p className="mt-1 text-base font-semibold tabular-nums">
                {speedTest.download}
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}
                  Mbps
                </span>
              </p>
            </div>
            <div>
              <p className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3" />
                Up
              </p>
              <p className="mt-1 text-base font-semibold tabular-nums">
                {speedTest.upload}
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}
                  Mbps
                </span>
              </p>
            </div>
            <div>
              <p className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Gauge className="h-3 w-3" />
                Ping
              </p>
              <p className="mt-1 text-base font-semibold tabular-nums">
                {speedTest.ping}
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}
                  ms
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Service memory footprint */}
        <div className={`${TILE} col-span-12 md:col-span-4`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Service memory
            </span>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-semibold tabular-nums tracking-tight">
            {(totalServiceMem / 1024).toFixed(1)}
            <span className="text-lg font-normal text-muted-foreground">
              {" "}
              GB
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            across {allServices.length} services
          </p>
        </div>

        {/* Recent incidents */}
        <div className={`${TILE} col-span-12 md:col-span-8`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Recent Incidents
            </span>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          {downtimeHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No incidents in the last 30 days.
            </p>
          ) : (
            <ul className="space-y-2">
              {downtimeHistory.map((inc, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 border-b border-border pb-2 text-xs last:border-0 last:pb-0"
                >
                  <div>
                    <span className="font-mono font-medium text-foreground">
                      {inc.service}
                    </span>
                    <span className="ml-1.5 text-muted-foreground">
                      — {inc.reason}
                    </span>
                    <p className="mt-0.5 text-muted-foreground">{inc.start}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-0.5 whitespace-nowrap text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {inc.duration}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Detailed tabs */}
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
