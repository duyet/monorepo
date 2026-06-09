import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
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
import { useNodes } from "@/hooks/useDashboard";

const snapshotDate = new Date().toLocaleString();

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

function HomelabPage() {
  const { onlineCount, totalNodes } = useNodes();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      let nextIndex: number | null = null;

      if (e.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        nextIndex = 0;
      } else if (e.key === "End") {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        const nextTab = tabs[nextIndex];
        setActiveTab(nextTab.id);
        tabRefs.current.get(nextTab.id)?.focus();
      }
    },
    [activeTab]
  );

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

        {/* Tab navigation */}
        <div
          className="flex flex-wrap gap-2 mb-6"
          role="tablist"
          onKeyDown={handleKeyDown}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => { if (el) tabRefs.current.set(tab.id, el); }}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-[var(--rd-r-sm)] px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--rd-text)] text-[var(--rd-bg)]"
                    : "bg-[var(--rd-surface)] text-[var(--rd-text-2)] ring-1 ring-[var(--rd-border)] hover:bg-[var(--rd-surface-2)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2"><NodesTile /></div>
            <div className="md:col-span-1"><ClusterStatsTile /></div>
            <div className="md:col-span-2"><ServicesTile /></div>
            <div className="md:col-span-1"><NetworkTile /></div>
            <div className="md:col-span-1"><SmartDevicesTile /></div>
            <div className="md:col-span-2"><AgentActionsTile /></div>
          </div>
        )}

        {activeTab === "infrastructure" && (
          <div className="space-y-8">
            <ErrorBoundary><ClusterTopology /></ErrorBoundary>
            <ErrorBoundary><ClusterOverview /></ErrorBoundary>
            <ErrorBoundary><ResourceMetrics /></ErrorBoundary>
            <ErrorBoundary><ServicesStatus /></ErrorBoundary>
            <ErrorBoundary><NetworkStats /></ErrorBoundary>
            <ErrorBoundary><ServiceDowntime /></ErrorBoundary>
          </div>
        )}

        {activeTab === "k8s" && (
          <ErrorBoundary><K8sInfo /></ErrorBoundary>
        )}

        {activeTab === "smart-devices" && (
          <ErrorBoundary><SmartDevicesOverview /></ErrorBoundary>
        )}

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
