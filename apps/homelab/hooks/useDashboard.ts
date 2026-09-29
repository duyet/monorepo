/**
 * Custom React Hooks for Dashboard Data
 * Encapsulates data fetching logic and provides a clean API for components
 */

import { useMemo } from "react"; // useMemo kept for hooks with real deps (useServices, useServiceSearch, useNode)
import {
  agentActions,
  boschWashingMachine,
  type ClusterInfo,
  type ClusterStats,
  clusterInfo,
  clusterStats,
  cpuHistory,
  downtimeHistory,
  dysonAirPurifier,
  k8sNamespaces,
  k8sPods,
  k8sSummary,
  memoryHistory,
  type Node,
  networkTraffic,
  nodes,
  type Service,
  services,
  smartDevices,
  speedTest,
} from "@/lib/data";

// Derived node slices — computed once from static module-level constants
const _onlineNodes = nodes.filter((n) => n.status === "online");
const _offlineNodes = nodes.filter((n) => n.status === "offline");
const _degradedNodes = nodes.filter((n) => n.status === "degraded");
const _nodesResult = {
  nodes,
  onlineNodes: _onlineNodes,
  offlineNodes: _offlineNodes,
  degradedNodes: _degradedNodes,
  totalNodes: nodes.length,
  onlineCount: _onlineNodes.length,
};

/**
 * Hook for cluster node data
 */
export function useNodes() {
  return _nodesResult;
}

/**
 * Hook for cluster statistics
 */
export function useClusterStats(): ClusterStats {
  return clusterStats;
}

const _resourceMetrics = { cpuHistory, memoryHistory };

/**
 * Hook for resource metrics (CPU & Memory)
 */
export function useResourceMetrics() {
  return _resourceMetrics;
}

/**
 * Hook for services with optional filtering
 */
export function useServices(namespace?: string) {
  return useMemo(() => {
    const filteredServices = namespace
      ? services.filter((s) => s.namespace === namespace)
      : services;

    const namespaces = Array.from(
      new Set(services.map((s) => s.namespace))
    ).sort();

    const servicesByNamespace = services.reduce(
      (acc, service) => {
        if (!acc[service.namespace]) {
          acc[service.namespace] = [];
        }
        acc[service.namespace].push(service);
        return acc;
      },
      {} as Record<string, Service[]>
    );

    const servicesByNode = services.reduce(
      (acc, service) => {
        if (!acc[service.node]) {
          acc[service.node] = [];
        }
        acc[service.node].push(service);
        return acc;
      },
      {} as Record<string, Service[]>
    );

    return {
      services: filteredServices,
      allServices: services,
      namespaces,
      servicesByNamespace,
      servicesByNode,
      totalServices: services.length,
      runningServices: services.filter((s) => s.status === "running").length,
    };
  }, [namespace]);
}

const _networkStats = { networkTraffic, speedTest };

/**
 * Hook for network statistics
 */
export function useNetworkStats() {
  return _networkStats;
}

/**
 * Hook for service downtime history
 */
export function useDowntimeHistory() {
  return downtimeHistory;
}

/**
 * Hook for searching services by name
 */
export function useServiceSearch(searchQuery: string) {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return services;
    }

    const query = searchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.namespace.toLowerCase().includes(query) ||
        service.node.toLowerCase().includes(query)
    );
  }, [searchQuery]);
}

/**
 * Hook for getting node by name
 */
export function useNode(nodeName: string): Node | undefined {
  return useMemo(() => nodes.find((n) => n.name === nodeName), [nodeName]);
}

const _smartDevicesResult = {
  devices: smartDevices,
  boschWashingMachine,
  dysonAirPurifier,
};

export interface SmartDeviceStatus {
  total: number;
  online: number;
  idle: number;
  offline: number;
}

/**
 * Count smart devices by status.
 *
 * "online" means `status === "online"` only. `idle` is a distinct state — the
 * device list gives it its own warning-coloured dot — so folding it into the
 * online count would report an idle device as online. The Lights card in
 * `SmartDevicesOverview` already counts only `"online"`; this keeps the headline
 * counts in step with it.
 */
export function countSmartDeviceStatus(
  devices: typeof smartDevices
): SmartDeviceStatus {
  return {
    total: devices.length,
    online: devices.filter((d) => d.status === "online").length,
    idle: devices.filter((d) => d.status === "idle").length,
    offline: devices.filter((d) => d.status === "offline").length,
  };
}

const _smartDeviceStatus = countSmartDeviceStatus(smartDevices);

/**
 * Hook for smart devices data
 */
export function useSmartDevices(): {
  devices: typeof smartDevices;
  boschWashingMachine: typeof boschWashingMachine;
  dysonAirPurifier: typeof dysonAirPurifier;
} {
  return _smartDevicesResult;
}

/**
 * Hook for the smart device status summary
 */
export function useSmartDeviceStatus(): SmartDeviceStatus {
  return _smartDeviceStatus;
}

/**
 * Hook for duyetbot-agent automated actions
 */
export function useAgentActions() {
  return agentActions;
}

/**
 * Hook for Kubernetes cluster data
 */
export function useK8s() {
  return { namespaces: k8sNamespaces, pods: k8sPods, summary: k8sSummary };
}

/**
 * Hook for cluster info (k3s platform details)
 */
export function useClusterInfo(): ClusterInfo {
  return clusterInfo;
}
