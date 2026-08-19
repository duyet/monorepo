import { Badge } from "@duyet/components/ui/badge";
import { Button } from "@duyet/components/ui/button";
import { Box, Server, Smartphone, Zap } from "lucide-react";
import {
  AgentActionsTile,
  ClusterStatsTile,
  NodesTile,
  SmartDevicesTile,
  StatusDot,
} from "@/components/tiles";
import { ClusterOverview } from "@/components/dashboard/ClusterOverview";
import { K8sInfo } from "@/components/dashboard/K8sInfo";
import { NetworkStats } from "@/components/dashboard/NetworkStats";
import { ResourceMetrics } from "@/components/dashboard/ResourceMetrics";
import { ServiceDowntime } from "@/components/dashboard/ServiceDowntime";
import { ServicesStatus } from "@/components/dashboard/ServicesStatus";
import { SmartDevicesOverview } from "@/components/smart-devices/SmartDevicesOverview";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useClusterInfo, useNodes } from "@/hooks/useDashboard";
import { createFileRoute } from "@tanstack/react-router";

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
    <div className="bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-4 pb-4 pt-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              <StatusDot status={onlineCount === totalNodes ? "online" : "degraded"} />
              Infrastructure · homelab.duyet.net
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Homelab
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <p className="text-sm font-medium">
                Kubernetes {clusterInfo.version}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {clusterInfo.platform} · {clusterInfo.cni} CNI · {clusterInfo.csi} CSI
              </p>
            </div>
            <Badge variant="secondary" className="gap-1.5 font-mono text-[11px] font-normal">
              <span className="size-1.5 rounded-full bg-[var(--rd-ok)]" />
              k3s
            </Badge>
          </div>
        </div>
      </section>

      <nav className="sticky top-[3.5rem] z-20 border-y bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Button
                key={s.id}
                variant="ghost"
                size="sm"
                asChild
                className="h-9 shrink-0 text-[13px] text-muted-foreground hover:text-foreground"
              >
                <a href={`#${s.id}`}>
                  <Icon className="size-3.5" />
                  {s.label}
                </a>
              </Button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6">
        <OverviewSection />
        <InfrastructureSection />
        <K8sSection />
        <SmartDevicesSection />
      </main>
    </div>
  );
}

function SectionLabel({
  id,
  kicker,
  title,
}: {
  id: string;
  kicker: string;
  title: string;
}) {
  return (
    <div id={id} className="scroll-mt-28 mb-3">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {kicker}
      </p>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function OverviewSection() {
  return (
    <section>
      <SectionLabel id="overview" kicker="At a glance" title="Overview" />
      <div className="space-y-3">
        <ErrorBoundary>
          <ClusterOverview />
        </ErrorBoundary>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <ErrorBoundary>
              <NodesTile />
            </ErrorBoundary>
          </div>
          <div className="min-w-0 lg:col-span-4">
            <ErrorBoundary>
              <ClusterStatsTile />
            </ErrorBoundary>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <ErrorBoundary>
              <AgentActionsTile />
            </ErrorBoundary>
          </div>
          <div className="min-w-0 lg:col-span-4">
            <ErrorBoundary>
              <SmartDevicesTile />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfrastructureSection() {
  return (
    <section>
      <SectionLabel id="infrastructure" kicker="Cluster" title="Infrastructure" />
      <div className="space-y-3">
        <ErrorBoundary>
          <ResourceMetrics />
        </ErrorBoundary>
        <ErrorBoundary>
          <NetworkStats />
        </ErrorBoundary>
        <ErrorBoundary>
          <ServicesStatus />
        </ErrorBoundary>
        <ErrorBoundary>
          <ServiceDowntime />
        </ErrorBoundary>
      </div>
    </section>
  );
}

function K8sSection() {
  return (
    <section>
      <SectionLabel id="k8s" kicker="Kubernetes" title="Cluster" />
      <ErrorBoundary>
        <K8sInfo />
      </ErrorBoundary>
    </section>
  );
}

function SmartDevicesSection() {
  return (
    <section>
      <SectionLabel id="smart-devices" kicker="Home" title="Smart devices" />
      <ErrorBoundary>
        <SmartDevicesOverview />
      </ErrorBoundary>
    </section>
  );
}
