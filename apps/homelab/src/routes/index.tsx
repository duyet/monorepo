import { createFileRoute } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";
import { Box, Server, Smartphone, Zap } from "lucide-react";
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
import { useNodes, useClusterInfo } from "@/hooks/useDashboard";
import { SecHead, Reveal } from "@duyet/components";

const tabs = [
  { id: "overview", label: "Overview", icon: Zap },
  { id: "infrastructure", label: "Infrastructure", icon: Server },
  { id: "k8s", label: "Kubernetes", icon: Box },
  { id: "smart-devices", label: "Smart Devices", icon: Smartphone },
] as const;

type TabId = (typeof tabs)[number]["id"];

export const Route = createFileRoute("/")({
  component: HomelabPage,
});

const _snapshotDate = new Date().toLocaleString();

function HomelabPage() {
  const { onlineCount, totalNodes } = useNodes();
  const clusterInfo = useClusterInfo();
  const search = useSearch({ strict: false }) as { tab?: TabId };
  const activeTab = search?.tab ?? "overview";

  return (
    <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
      {/* Hero section */}
      <section
        className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(32px,4vw,56px)] pb-[clamp(56px,8vw,96px)]"
      >
        <Reveal>
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
        </Reveal>

        <Reveal delay={100}>
          <div
            className="flex items-center justify-between py-4 border-t border-[var(--rd-line)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--rd-accent-bg)]">
                <Server className="h-4 w-4 text-[var(--rd-accent)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--rd-text)]">
                  Kubernetes {clusterInfo.version}
                </p>
                <p className="text-xs text-[var(--rd-text-3)]">
                  {clusterInfo.platform} · {clusterInfo.cni} CNI · {clusterInfo.csi} CSI
                </p>
              </div>
            </div>
            <span className="rd-chip inline-flex items-center gap-1.5">
              <span
                className="inline-block w-[7px] h-[7px] rounded-full"
                style={{ background: "var(--rd-ok)" }}
              />
              k3s
            </span>
          </div>
        </Reveal>
      </section>

      {/* Tab content */}
      {activeTab === "overview" && (
        <OverviewTab />
      )}

      {activeTab === "infrastructure" && (
        <InfrastructureTab />
      )}

      {activeTab === "k8s" && (
        <K8sTab />
      )}

      {activeTab === "smart-devices" && (
        <SmartDevicesTab />
      )}
    </div>
  );
}

function OverviewTab() {
  return (
    <Reveal>
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2"><NodesTile /></div>
          <div className="md:col-span-1"><ClusterStatsTile /></div>
          <div className="md:col-span-2"><ServicesTile /></div>
          <div className="md:col-span-1"><NetworkTile /></div>
          <div className="md:col-span-1"><SmartDevicesTile /></div>
          <div className="md:col-span-2"><AgentActionsTile /></div>
        </div>
      </section>
    </Reveal>
  );
}

function InfrastructureTab() {
  return (
    <Reveal>
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]">
        <SecHead
          num="01"
          eyebrow="Cluster"
          title="Topology"
        />
        <ErrorBoundary><ClusterTopology /></ErrorBoundary>

        <SecHead
          num="02"
          eyebrow="Cluster"
          title="Overview"
        />
        <ErrorBoundary><ClusterOverview /></ErrorBoundary>

        <SecHead
          num="03"
          eyebrow="Resources"
          title="CPU &amp; Memory"
        />
        <ErrorBoundary><ResourceMetrics /></ErrorBoundary>

        <SecHead
          num="04"
          eyebrow="Services"
          title="Status"
        />
        <ErrorBoundary><ServicesStatus /></ErrorBoundary>

        <SecHead
          num="05"
          eyebrow="Network"
          title="Traffic"
        />
        <ErrorBoundary><NetworkStats /></ErrorBoundary>

        <SecHead
          num="06"
          eyebrow="Reliability"
          title="Downtime"
        />
        <ErrorBoundary><ServiceDowntime /></ErrorBoundary>
      </section>
    </Reveal>
  );
}

function K8sTab() {
  return (
    <Reveal>
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]">
        <SecHead
          num="01"
          eyebrow="Kubernetes"
          title="Cluster Info"
        />
        <ErrorBoundary><K8sInfo /></ErrorBoundary>
      </section>
    </Reveal>
  );
}

function SmartDevicesTab() {
  return (
    <Reveal>
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]">
        <SecHead
          num="01"
          eyebrow="Home"
          title="Smart Devices"
        />
        <ErrorBoundary><SmartDevicesOverview /></ErrorBoundary>
      </section>
    </Reveal>
  );
}