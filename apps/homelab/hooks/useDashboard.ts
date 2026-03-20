/**
 * Custom React Hooks for Dashboard Data
 * Encapsulates data fetching logic and provides a clean API for components
 */

import { useMemo } from "react"; // useMemo kept for hooks with real deps (useServices, useServiceSearch, useNode)
import {
  boschWashingMachine,
  type ClusterStats,
  clusterStats,
  cpuHistory,
  downtimeHistory,
  dysonAirPurifier,
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

const _namespaces = Array.from(
  new Set(services.map((s) => s.namespace))
).sort();

/**
 * Hook for getting all unique namespaces
 */
export function useNamespaces() {
  return _namespaces;
}

const _smartDevicesResult = {
  devices: smartDevices,
  boschWashingMachine,
  dysonAirPurifier,
};

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
