"use client";

import { useMemo } from "react";
import { ClusterOverview } from "@/components/dashboard/ClusterOverview";
import { ClusterTopology } from "@/components/dashboard/ClusterTopology";
import { NetworkStats } from "@/components/dashboard/NetworkStats";
import { ResourceMetrics } from "@/components/dashboard/ResourceMetrics";
import { ServiceDowntime } from "@/components/dashboard/ServiceDowntime";
import { ServicesStatus } from "@/components/dashboard/ServicesStatus";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlertNotifications } from "@/components/dashboard/AlertNotifications";
import { AlertStatusBanner } from "@/components/dashboard/AlertStatusBanner";
import { useNodes, useServices } from "@/hooks/useDashboard";
import { useAlerts } from "@/hooks/useAlerts";

export const metadata = {
  title: "Homelab Dashboard | duyet.net",
  description: "Real-time monitoring dashboard for microk8s cluster",
};

export default function HomelabPage() {
  // Get data for alert evaluation
  const { nodes } = useNodes();
  const { services } = useServices();

  // Initialize alert system
  const {
    alerts,
    acknowledgeAlert,
    criticalAlerts,
    warningAlerts,
    stats,
  } = useAlerts(nodes, services);

  const snapshotDate = new Date().toLocaleString();
  const isRealtime = !stats; // Will be determined by API response

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header with Alert Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            Homelab Dashboard
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            {isRealtime ? "Live" : "Snapshot"} at {snapshotDate}
          </p>
        </div>
        <AlertNotifications
          alerts={alerts}
          onAcknowledge={acknowledgeAlert}
        />
      </div>

      {/* Critical Alert Banner */}
      <AlertStatusBanner
        alerts={alerts}
        onDismiss={() => {/* Optional dismiss handler */}}
      />

      {/* Quick Stats Summary (Mobile Optimized) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:hidden">
        <div className="rounded-xl bg-claude-lavender/20 p-3">
          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Alerts
          </p>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
            {stats.active}
          </p>
        </div>
        <div className="rounded-xl bg-claude-mint/20 p-3">
          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Online
          </p>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
            {nodes.filter((n) => n.status === "online").length}/{nodes.length}
          </p>
        </div>
      </div>

      {/* Cluster Topology - Hide on very small screens */}
      <ErrorBoundary>
        <div className="hidden md:block">
          <ClusterTopology />
        </div>
      </ErrorBoundary>

      {/* Cluster Overview */}
      <ErrorBoundary>
        <ClusterOverview />
      </ErrorBoundary>

      {/* Resource Metrics (CPU & Memory) */}
      <ErrorBoundary>
        <ResourceMetrics />
      </ErrorBoundary>

      {/* Services Status - Collapsible on Mobile */}
      <ErrorBoundary>
        <ServicesStatus />
      </ErrorBoundary>

      {/* Network Stats */}
      <ErrorBoundary>
        <NetworkStats />
      </ErrorBoundary>

      {/* Service Downtime - Simplified on mobile */}
      <ErrorBoundary>
        <ServiceDowntime />
      </ErrorBoundary>

      {/* Orchestration and Info Footer */}
      <div className="space-y-2 border-t pt-4">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-medium">Orchestration:</span> microk8s
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {isRealtime ? "Real-time dashboard" : "Dashboard snapshot taken at"} {snapshotDate}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          Data refreshes every 30 seconds
        </p>
      </div>
    </div>
  );
}
