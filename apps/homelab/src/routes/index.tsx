import { createFileRoute } from "@tanstack/react-router";
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

const sections = [
  { id: "overview", label: "Overview", icon: Zap },
  { id: "infrastructure", label: "Infrastructure", icon: Server },
  { id: "k8s", label: "Kubernetes", icon: Box },
  { id: "smart-devices", label: "Smart Devices", icon: Smartphone },
] as const;

export const Route = createFileRoute("/")({
  component: HomelabPage,
});

function HomelabPage() {
  const { onlineCount, totalNodes } = useNodes();
  const clusterInfo = useClusterInfo();

  return (
    <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
      {/* Hero — compact */}
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(24px,3vw,40px)] pb-[clamp(16px,2vw,24px)]">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="rd-eyebrow mb-2">
                <StatusDot status={onlineCount === totalNodes ? "online" : "degraded"} />
                Infrastructure · homelab.duyet.net
              </div>
              <h1 className="rd-display text-[clamp(1.8rem,3.6vw,2.6rem)] mt-0">
                Homelab
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--rd-text)]">
                  Kubernetes {clusterInfo.version}
                </p>
                <p className="text-xs text-[var(--rd-text-3)]">
                  {clusterInfo.platform} · {clusterInfo.cni} CNI · {clusterInfo.csi} CSI
                </p>
              </div>
              <span className="rd-chip inline-flex items-center gap-1.5">
                <span
                  className="inline-block w-[7px] h-[7px] rounded-full"
                  style={{ background: "var(--rd-ok)" }}
                />
                k3s
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Sticky in-page jump nav */}
      <nav className="sticky top-[3.5rem] z-20 border-y border-[var(--rd-line)] bg-[var(--rd-bg)]/85 backdrop-blur">
        <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] flex gap-1 overflow-x-auto">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 whitespace-nowrap py-2.5 px-3 text-[13px] font-medium text-[var(--rd-text-2)] hover:text-[var(--rd-text)] transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </a>
            );
          })}
        </div>
      </nav>

      {/* All sections, stacked — nothing hidden behind tabs */}
      <OverviewTab />
      <InfrastructureTab />
      <K8sTab />
      <SmartDevicesTab />
    </div>
  );
}

function OverviewTab() {
  return (
    <Reveal>
      <section id="overview" className="scroll-mt-28 mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(24px,3vw,36px)]">
        <SecHead num="01" eyebrow="At a glance" title="Overview" />
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
      <section id="infrastructure" className="scroll-mt-28 mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(24px,3vw,36px)] border-t border-[var(--rd-line)]">
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
      <section id="k8s" className="scroll-mt-28 mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(24px,3vw,36px)] border-t border-[var(--rd-line)]">
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
      <section id="smart-devices" className="scroll-mt-28 mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(24px,3vw,36px)] border-t border-[var(--rd-line)]">
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