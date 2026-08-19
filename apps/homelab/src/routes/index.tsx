import { SecHead } from "@duyet/components";
import { createFileRoute } from "@tanstack/react-router";
import { AgentActionsTile, NodesTile, SmartDevicesTile, StatusDot } from "@/components/tiles";
import { ClusterOverview } from "@/components/dashboard/ClusterOverview";
import { K8sInfo } from "@/components/dashboard/K8sInfo";
import { NetworkStats } from "@/components/dashboard/NetworkStats";
import { ResourceMetrics } from "@/components/dashboard/ResourceMetrics";
import { ServiceDowntime } from "@/components/dashboard/ServiceDowntime";
import { ServicesStatus } from "@/components/dashboard/ServicesStatus";
import { SmartDevicesOverview } from "@/components/smart-devices/SmartDevicesOverview";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useClusterInfo, useClusterStats, useNodes } from "@/hooks/useDashboard";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "k8s", label: "Kubernetes" },
  { id: "smart-devices", label: "Smart devices" },
] as const;

const INTRO =
  "A small k3s lab on mini PCs, a Raspberry Pi, and a few home devices. Metrics here are mock data that refresh on each build.";

export const Route = createFileRoute("/")({
  component: HomelabPage,
});

function HomelabPage() {
  const { onlineCount, totalNodes } = useNodes();
  const clusterInfo = useClusterInfo();
  const stats = useClusterStats();

  return (
    <div>
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(32px,4.5vw,56px)] pb-[clamp(22px,3vw,36px)]">
        <h1 className="rd-display text-[clamp(2.4rem,5.5vw,4rem)]">
          Homelab, a{" "}
          <span className="text-[var(--rd-accent)]">k3s cluster</span>.
        </h1>
        <p className="rd-lead mt-[16px] max-w-[64ch] text-[clamp(1.02rem,1.4vw,1.18rem)]">
          {INTRO}
        </p>
        <div className="mt-[16px] flex flex-wrap items-center gap-5 font-[var(--font-mono)] text-[13px] text-[var(--rd-text-3)]">
          <span className="inline-flex items-center gap-2">
            <StatusDot status={onlineCount === totalNodes ? "online" : "degraded"} />
            <strong className="text-[var(--rd-accent)]">
              {onlineCount}/{totalNodes}
            </strong>{" "}
            nodes
          </span>
          <span>
            <strong className="text-[var(--rd-accent)]">
              {stats.runningServices}/{stats.totalServices}
            </strong>{" "}
            services
          </span>
          <span>
            {clusterInfo.platform} {clusterInfo.version}
          </span>
          <span>
            {clusterInfo.cni} · {clusterInfo.csi}
          </span>
        </div>

        <nav className="mt-6 flex gap-5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 text-[16px] tracking-tight text-[var(--rd-text-3)] no-underline transition-colors hover:text-[var(--rd-text)]"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </section>

      <OverviewSection />
      <InfrastructureSection />
      <K8sSection />
      <SmartDevicesSection />
    </div>
  );
}

function OverviewSection() {
  return (
    <section
      id="overview"
      className="scroll-mt-24 mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(28px,3.5vw,44px)] border-t border-[var(--rd-border)]"
    >
      <SecHead eyebrow="At a glance" title="Overview" />
      <div className="space-y-8">
        <ErrorBoundary>
          <ClusterOverview />
        </ErrorBoundary>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <ErrorBoundary>
              <NodesTile />
            </ErrorBoundary>
          </div>
          <div className="min-w-0 lg:col-span-4">
            <ErrorBoundary>
              <SmartDevicesTile />
            </ErrorBoundary>
          </div>
        </div>
        <ErrorBoundary>
          <AgentActionsTile />
        </ErrorBoundary>
      </div>
    </section>
  );
}

function InfrastructureSection() {
  return (
    <section
      id="infrastructure"
      className="scroll-mt-24 mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(28px,3.5vw,44px)] border-t border-[var(--rd-border)]"
    >
      <SecHead eyebrow="Cluster" title="Infrastructure" />
      <div className="space-y-10">
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
    <section
      id="k8s"
      className="scroll-mt-24 mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(28px,3.5vw,44px)] border-t border-[var(--rd-border)]"
    >
      <SecHead eyebrow="Kubernetes" title="Cluster" />
      <ErrorBoundary>
        <K8sInfo />
      </ErrorBoundary>
    </section>
  );
}

function SmartDevicesSection() {
  return (
    <section
      id="smart-devices"
      className="scroll-mt-24 mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(28px,3.5vw,44px)] pb-[clamp(44px,6vw,72px)] border-t border-[var(--rd-border)]"
    >
      <SecHead eyebrow="Home" title="Smart devices" />
      <ErrorBoundary>
        <SmartDevicesOverview />
      </ErrorBoundary>
    </section>
  );
}
