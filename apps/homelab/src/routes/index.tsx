import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Clock,
  Database,
  Gauge,
  HardDrive,
  Network,
  Server,
  Smartphone,
  Wifi,
} from "lucide-react";
import {
  Badge,
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

function HomelabPage() {
  const { nodes, onlineCount, totalNodes } = useNodes();
  const { runningServices, totalServices, allServices } = useServices();
  const { devices } = useSmartDevices();
  const clusterStats = useClusterStats();
  const { speedTest } = useNetworkStats();
  const downtimeHistory = useDowntimeHistory();
  const onlineDevices = devices.filter((d) => d.status !== "offline");

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

      {/* Bento grid
          12-col layout (desktop):
          [Nodes 4 / row-span-2][Services 4][Devices 4]
          [Nodes cont.         ][Cluster stats 8      ]
          [Network 4][Incidents 8                     ]
      */}
      <div className="grid grid-cols-12 gap-3 auto-rows-min">

        {/* Nodes — tall card, spans 2 rows on md+ */}
        <Card className="col-span-12 md:col-span-4 md:row-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nodes
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums tracking-tight">
              {onlineCount}
              <span className="text-lg font-normal text-muted-foreground">
                /{totalNodes}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">
              online
            </p>
            <ul className="space-y-2">
              {nodes.map((node) => (
                <li key={node.id} className="flex items-center justify-between text-xs">
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
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {node.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="col-span-6 md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Services
            </CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums tracking-tight">
              {runningServices}
              <span className="text-lg font-normal text-muted-foreground">
                /{totalServices}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">
              running
            </p>
            <ul className="space-y-1">
              {allServices.slice(0, 5).map((svc) => (
                <li
                  key={`${svc.name}-${svc.node}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span className="h-1 w-1 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="font-mono truncate">{svc.name}</span>
                </li>
              ))}
              {allServices.length > 5 && (
                <li className="text-xs text-muted-foreground pl-2.5">
                  +{allServices.length - 5} more
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card className="col-span-6 md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Devices
            </CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums tracking-tight">
              {onlineDevices.length}
              <span className="text-lg font-normal text-muted-foreground">
                /{devices.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">
              online
            </p>
            <ul className="space-y-1.5">
              {devices.map((d) => (
                <li key={d.id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground truncate">{d.name}</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 ml-2 flex-shrink-0"
                  >
                    {d.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Cluster stats — wide card occupying the second row right side */}
        <Card className="col-span-12 md:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Cluster
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
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
                <p className="text-xs text-muted-foreground flex items-center gap-1">
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
                <p className="text-xs text-muted-foreground flex items-center gap-1">
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
                <p className="text-xs text-muted-foreground flex items-center gap-1">
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
          </CardContent>
        </Card>

        {/* Network speed */}
        <Card className="col-span-12 md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Network
            </CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-0.5">
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
                <p className="text-xs text-muted-foreground flex items-center gap-0.5">
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
                <p className="text-xs text-muted-foreground flex items-center gap-0.5">
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
          </CardContent>
        </Card>

        {/* Recent incidents */}
        <Card className="col-span-12 md:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Incidents
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {downtimeHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No incidents in the last 30 days.
              </p>
            ) : (
              <ul className="space-y-2">
                {downtimeHistory.map((inc, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-3 text-xs border-b last:border-0 pb-2 last:pb-0"
                  >
                    <div>
                      <span className="font-mono font-medium text-foreground">
                        {inc.service}
                      </span>
                      <span className="text-muted-foreground ml-1.5">
                        — {inc.reason}
                      </span>
                      <p className="text-muted-foreground mt-0.5">{inc.start}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-muted-foreground whitespace-nowrap flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      {inc.duration}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
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
